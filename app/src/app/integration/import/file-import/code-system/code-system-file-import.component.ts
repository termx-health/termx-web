import {Component, ElementRef, Injectable, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'app/src/environments/environment';
import {collect, copyDeep, DestroyService, group, isNil, LoadingManager} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {LocalizedName} from '@kodality-web/marina-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {merge, mergeMap, Observable, of, Subject, switchMap, take, takeUntil, timer} from 'rxjs';
import {Router} from '@angular/router';
import {CodeSystem, CodeSystemLibService, CodeSystemVersion, EntityProperty} from '../../../../resources/_lib';
import {JobLibService, JobLog, JobLogResponse} from '../../../../job/_lib';

const IMPORT_TEMPLATES: {[p: string]: FileImportPropertyRow[]} = {
  'pub.e-tervis': [
    {
      columnName: 'Kood',
      propertyName: 'concept-code',
      propertyType: 'string',
      preferred: true,
      import: true
    },
    {
      columnName: 'Lühinimetus',
      propertyName: 'alias',
      propertyType: 'string',
      lang: 'et',
      import: false
    },
    {
      columnName: 'Nimetus',
      propertyName: 'display',
      propertyType: 'string',
      lang: 'et',
      import: true
    },
    {
      columnName: 'Pikk_nimetus',
      propertyName: 'designation',
      propertyType: 'string',
      lang: 'et',
      import: true
    },
    {
      columnName: 'Vanem_kood',
      propertyName: 'parent',
      propertyType: 'code',
      import: false
    },
    {
      columnName: 'Hierarhia_aste',
      propertyName: 'level',
      propertyType: 'integer',
      import: false
    },
    {
      columnName: 'Kehtivuse_alguse_kpv',
      propertyName: 'validFrom',
      propertyType: 'dateTime',
      propertyTypeFormat: 'dd.MM.yyyy',
      import: true
    },
    {
      columnName: 'Kehtivuse_lõpu_kpv',
      propertyName: 'validTo',
      propertyType: 'dateTime',
      propertyTypeFormat: 'dd.MM.yyyy',
      import: true
    },
    {
      columnName: 'Viimane_muudatus_kpv',
      propertyName: 'modifiedAt',
      propertyType: 'dateTime',
      propertyTypeFormat: 'dd.MM.yyyy',
      import: true
    },
    {
      columnName: 'Staatus',
      propertyName: 'status',
      propertyType: 'boolean',
      import: true
    },
    {
      columnName: 'Selgitus',
      propertyName: 'description',
      propertyType: 'string',
      lang: 'et',
      import: false
    }
  ],
  'icf': [
    {
      columnName: 'Foundation URI',
      propertyName: 'foundationUri',
      propertyType: 'string',
      import: true
    },
    {
      columnName: 'Linearization (release) URI',
      propertyName: 'linearizationUri',
      propertyType: 'string',
      import: true
    },
    {
      columnName: 'Code',
      propertyName: 'concept-code',
      propertyType: 'string',
      preferred: true,
      import: true
    },
    {
      columnName: 'BlockId',
      propertyName: 'concept-code',
      propertyType: 'string',
      preferred: false,
      import: true
    },
    {
      columnName: 'Title',
      propertyName: 'display',
      propertyType: 'string',
      lang: 'en',
      import: true
    },
    {
      columnName: 'Title',
      propertyName: 'display',
      propertyType: 'string',
      lang: 'en',
      import: true
    },
    {
      columnName: 'ClassKind',
      propertyName: 'classKind',
      propertyType: 'string',
      import: false
    },
    {
      columnName: 'DepthInKind',
      propertyName: 'level',
      propertyType: 'integer',
      import: false
    },
    {
      columnName: 'IsResidual',
      propertyName: 'residual',
      propertyType: 'boolean',
      import: true
    },
    {
      columnName: 'isLeaf',
      propertyName: 'leaf',
      propertyType: 'boolean',
      import: true
    },
    {
      columnName: 'PrimaryLocation',
      propertyName: 'primaryLocation',
      propertyType: 'boolean',
      import: true
    },
    {
      columnName: 'ChapterNo',
      propertyName: 'chapterNo',
      propertyType: 'integer',
      import: false
    },
    {
      columnName: 'ChapterNo',
      propertyName: 'chapterNo',
      propertyType: 'integer',
      import: false
    },
    {
      columnName: 'BrowserLink',
      propertyName: 'browserLink',
      propertyType: 'string',
      import: false
    },
    {
      columnName: 'iCatLink',
      propertyName: 'iCatLink',
      propertyType: 'string',
      import: false
    },
    {
      columnName: 'noOfNonResidualChildren',
      propertyName: 'nonResidualChildrenNumber',
      propertyType: 'integer',
      import: false
    }
  ]
};

const DEFAULT_KTS_PROPERTIES: EntityProperty[] = [
  {name: 'concept-code', type: 'string'},
  {name: 'description', type: 'string'},
  {name: 'definition', type: 'string'},
  {name: 'display', type: 'string'},
  {name: 'parent', type: 'code'}
];


// analysis
interface FileAnalysisRequest {
  link: string;
  type: string;
}

interface FileAnalysisResponse {
  // parsed properties from the file
  properties?: FileAnalysisResponseProperty[];
}

interface FileAnalysisResponseProperty {
  columnName?: string;
  columnType?: string;
  columnTypeFormat?: string;
  hasValues?: boolean;
}


type FileImportPropertyRow = FileProcessingRequestProperty & {
  import: boolean
}


// processing
interface FileProcessingRequest {
  type: string;
  link?: string;

  codeSystem?: {
    id?: string;
    uri?: string;
    names?: LocalizedName;
    description?: string;
  };
  version?: {
    id?: number,
    version?: string;
    status?: string;
    releaseDate?: Date;
  };

  properties?: FileProcessingRequestProperty[];
  generateValueSet?: boolean;
  dryRun?: boolean;
  cleanRun?: boolean
}

interface FileProcessingRequestProperty {
  columnName?: string;
  propertyName?: string;
  propertyType?: string;
  propertyTypeFormat?: string;
  preferred?: boolean;
  lang?: string;
}


@Injectable()
class CodeSystemFileImportService {
  public readonly baseUrl = `${environment.terminologyApi}/file-importer/code-system`;

  public constructor(
    private http: HttpClient,
    private jobService: JobLibService,
    private destroy$: DestroyService
  ) { }


  public validate(_props: FileImportPropertyRow[]): string[] {
    const props = _props.filter(p => p.import).filter(p => p.propertyName);
    const propMap = collect(props, p => p.propertyName!);

    const errors: string[] = [];

    const duplicates = Object.keys(propMap).filter(p => propMap[p].length > 1).filter(Boolean);
    if (duplicates.filter(p => p === 'identifier').length) {
      errors.push(`Code system MUST have only one "identifier" property`);
    }

    const propertiesWithoutFormat = props.filter(p => ['date', 'dateTime'].includes(p.propertyType) && isNil(p.propertyTypeFormat));
    if (propertiesWithoutFormat.length) {
      propertiesWithoutFormat.forEach(p => errors.push(`Please define the type format for the "${p.propertyName}" property`));
    }

    const forbiddenNewProperties = props.filter(p => ['code', 'Coding'].includes(p.propertyType) && p['_newProp']);
    if (forbiddenNewProperties.length) {
      errors.push(`Please create code system and define ${forbiddenNewProperties.map(p => `"${p.propertyName}"`).join(', ')} properties there`);
    }

    return errors;
  }

  public analyze(req: FileAnalysisRequest, file?: Blob): Observable<FileAnalysisResponse> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }
    return this.http.post<FileAnalysisResponse>(`${this.baseUrl}/analyze`, fd);
  }


  public processRequest(req: FileProcessingRequest, file: Blob): Observable<JobLog> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }

    const startResponsePolling = (jobId: number): Observable<JobLog> => {
      const poll$ = new Subject();

      timer(0, 3000).pipe(
        takeUntil(merge(poll$, this.destroy$)),
        switchMap(() => this.jobService.getLog(jobId)),
      ).subscribe(resp => {
        if (resp.execution?.status !== 'running') {
          poll$.next(resp);
        }
      });

      return poll$.pipe(take(1));
    };

    return this.http.post<JobLogResponse>(`${this.baseUrl}/process`, fd).pipe(
      mergeMap(resp => startResponsePolling(resp.jobId))
    );
  };
}

@Component({
  templateUrl: 'code-system-file-import.component.html',
  styles: [`
    .import-alert {
      margin: 0;

      &:after {
        height: 100%;
        width: 2px;
      }
    }
  `],
  providers: [DestroyService, CodeSystemFileImportService]
})
export class CodeSystemFileImportComponent {
  public readonly baseUrl = `${environment.terminologyApi}/file-importer/code-system`;

  public sourceCodeSystem: CodeSystem;

  public data: {
    // general
    codeSystem: CodeSystem,
    codeSystemVersion?: {
      versionId?: number;
      version?: string;
      status?: string;
      releaseDate?: Date;
    },
    generateValueSet?: boolean;
    dryRun?: boolean;
    cleanRun?: boolean
    // source
    source?: {
      type?: string,
      format?: string
      file?: string,
    }
    // properties
    template?: string
  } = {
    codeSystem: {},
    codeSystemVersion: {},
    generateValueSet: false,
    dryRun: false,
    cleanRun: false,
    source: {
      type: 'link',
      format: 'csv',
      file: undefined
    }
  };

  public analyzeResponse: {
    parsedProperties: FileImportPropertyRow[],
    origin?: FileAnalysisRequest
  } = {
    parsedProperties: []
  };


  public loader = new LoadingManager();
  public validations: string[];
  public jobLog: JobLog;


  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('jsonFileInput') public jsonFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private codeSystemLibService: CodeSystemLibService,
    private importService: CodeSystemFileImportService,
    private jobService: JobLibService,
    private destroy$: DestroyService,
    private router: Router
  ) {}

  public createCodeSystem(): void {
    this.sourceCodeSystem = undefined;
    this.data.codeSystem = new CodeSystem();
    this.data.codeSystem['_new'] = true;
  }

  public createCodeSystemVersion(): void {
    this.data.codeSystemVersion = {
      status: 'draft'
    };
    this.data.codeSystemVersion['_new'] = true;
  }


  protected onCodeSystemSelect(id: string): void {
    const req$ = id ? this.codeSystemLibService.load(id, true) : of(undefined);

    this.loader.wrap('cs', req$).subscribe(cs => {
      this.sourceCodeSystem = cs;
      this.data.codeSystemVersion = {};
      this.data.codeSystemVersion['_new'] = true; // fixme: delete
      this.data.cleanRun = false;

      const draftVersions = cs?.versions?.filter(v => this.filterVersion(v, 'draft'));
      if (!draftVersions?.length) {
        this.createCodeSystemVersion();
      }
    });
  }

  protected analyze(): void {
    const req: FileAnalysisRequest = {
      type: this.data.source.format,
      link: this.data.source.file
    };

    const file: Blob = this.data.source.type === 'file'
      ? this.fileInput?.nativeElement?.files?.[0]
      : undefined;

    this.loader.wrap('analyze', this.importService.analyze(req, file)).subscribe(({properties}) => {
      const toPropertyRow = (p: FileAnalysisResponseProperty): FileImportPropertyRow => ({
        columnName: p.columnName,
        propertyType: p.columnType,
        propertyTypeFormat: p.columnTypeFormat,
        import: !!p.hasValues
      });

      this.analyzeResponse = {
        origin: copyDeep(req),
        parsedProperties: properties?.map(toPropertyRow) ?? []
      };

      this.validations = [];
      this.data.template = undefined;
    });
  }

  private validate(): string[] {
    return this.importService.validate(this.analyzeResponse.parsedProperties);
  }

  protected process(): void {
    this.validations = this.jobLog = undefined;
    if ((this.validations = this.validate()).length) {
      return;
    }

    const req: FileProcessingRequest = {
      // request
      link: this.analyzeResponse.origin?.link!,
      type: this.analyzeResponse.origin?.type!,
      properties: this.analyzeResponse.parsedProperties?.filter(p => p.import),
      generateValueSet: this.data.generateValueSet,
      dryRun: this.data.dryRun,
      cleanRun: this.data.cleanRun,

      // meta
      codeSystem: {
        id: this.data.codeSystem.id,
        ...(this.data.codeSystem['_new'] && {
          uri: this.data.codeSystem.uri,
          names: this.data.codeSystem.names,
          description: this.data.codeSystem.description,
        })
      },
      version: {
        id: this.data.codeSystemVersion.versionId,
        version: this.data.codeSystemVersion.version,
        status: this.data.codeSystemVersion.status,
        releaseDate: this.data.codeSystemVersion.releaseDate,
      },
    };

    this.processRequest(req);
  }

  protected processRequest(req: FileProcessingRequest): void {
    let file: Blob;
    if (['csv', 'tsv', 'json'].includes(req.type)) {
      const fileInput = 'json' === req.type
        ? this.jsonFileInput
        : this.fileInput;
      file = fileInput?.nativeElement?.files?.[0];
    }

    this.jobLog = undefined;
    this.loader.wrap('process', this.importService.processRequest(req, file)).subscribe(resp => {
      this.jobLog = resp;
      if (!resp.errors && !resp.warnings) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent!, {duration: 0, closable: true});
      }
    });
  };

  protected downloadLog(): void {
    const errors = this.jobLog.errors.join('\n').replace(/ApiException: .+: /gm, '');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(errors));
    element.setAttribute('download', ['log', this.data.codeSystem.id].filter(Boolean).join('_') + '.txt');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  /* Parsed properties table */

  protected applyTemplate(): void {
    const existingPropertyNames = this.combineWithDefaults(this.sourceCodeSystem?.properties).map(p => p.name);

    const template = group(IMPORT_TEMPLATES[this.data.template], p => p.columnName);
    if (!template) {
      return;
    }

    this.analyzeResponse.parsedProperties.forEach(pp => {
      const prop = template[pp.columnName];
      if (!prop) {
        return;
      }
      pp['_newProp'] = !existingPropertyNames.includes(prop.propertyName);
      pp.propertyName = prop.propertyName;
      pp.propertyType = prop.propertyType;
      pp.propertyTypeFormat = prop.propertyTypeFormat;
      pp.preferred = prop.preferred;
      pp.lang = prop.lang;
      pp.import = prop.import;
      this.onPropertyPreferredChange(pp);
    });
  }

  protected onPropertyNameChange(item: FileImportPropertyRow): void {
    const entityProperties = this.combineWithDefaults(this.sourceCodeSystem?.properties);
    const grouped = group(entityProperties, p => p.name);

    item.propertyType = grouped[item.propertyName]?.type;
    this.onPropertyTypeChange(item);
  }

  protected onPropertyTypeChange(item: FileImportPropertyRow): void {
    item.propertyTypeFormat = undefined;
  }

  protected onPropertyPreferredChange(item: FileImportPropertyRow): void {
    this.analyzeResponse.parsedProperties.filter(p => p !== item).forEach(p => p.preferred = false);
  }

  protected combineWithDefaults(entityProperties: EntityProperty[]): EntityProperty[] {
    return Object.values({
      ...group<string, EntityProperty>(DEFAULT_KTS_PROPERTIES, e => e.name!),
      ...group<string, EntityProperty>(entityProperties || [], e => e.name!),
    });
  }

  protected get hasDuplicateIdentifiers(): boolean {
    return this.analyzeResponse.parsedProperties.filter(p => p.propertyName === 'concept-code').length > 1;
  }


  /* Utils */

  protected openCodeSystem(id: string, mode: 'edit' | 'view'): void {
    this.router.navigate(['/resources/code-systems/', id, mode]);
  }

  protected getVersions = (versions: CodeSystemVersion[]): string[] => {
    return versions?.map(v => v.version);
  };

  protected filterVersion = (v: CodeSystemVersion, status: string): boolean => {
    return v.status === status;
  };

  protected get isNewResource(): boolean {
    return this.data?.codeSystem?.['_new'];
  }

  protected get isNewVersion(): boolean {
    return this.data?.codeSystemVersion?.['_new'];
  }
}
