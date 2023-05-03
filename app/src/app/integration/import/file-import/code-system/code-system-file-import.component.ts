import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'app/src/environments/environment';
import {collect, copyDeep, DestroyService, group, isNil, LoadingManager} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {LocalizedName} from '@kodality-web/marina-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {filter, map, merge, Observable, Subject, switchMap, takeUntil, timer} from 'rxjs';
import {Router} from '@angular/router';
import {CodeSystem, CodeSystemLibService, EntityProperty} from '../../../../resources/_lib';
import {JobLibService, JobLog, JobLogResponse} from '../../../../job/_lib';

const IMPORT_TEMPLATES: {
  [p: string]: FileImportPropertyRow[]
} = {
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
  properties?: {
    columnName?: string;
    columnType?: string;
    columnTypeFormat?: string;
    hasValues?: boolean;
  }[];
}


// processing
interface FileProcessingRequest {
  link?: string;
  type: string;
  properties?: FileProcessingRequestProperty[];
  generateValueSet?: boolean;

  codeSystem?: {
    id: string;
    uri?: string;
    names?: LocalizedName;
    description?: string;
  };
  version?: {
    version?: string;
    status?: string;
    releaseDate?: Date;
  };
}

interface FileProcessingRequestProperty {
  columnName?: string;
  propertyName?: string;
  propertyType?: string;
  propertyTypeFormat?: string;
  preferred?: boolean;
  lang?: string;
}

type FileImportPropertyRow = FileProcessingRequestProperty & {import: boolean}


@Component({
  templateUrl: 'code-system-file-import.component.html',
  providers: [DestroyService]
})
export class CodeSystemFileImportComponent {
  public readonly baseUrl = `${environment.terminologyApi}/file-importer/code-system`;

  public data: {
    // general
    codeSystem: CodeSystem,
    loadedCodeSystem?: CodeSystem,
    version?: {
      version?: string;
      status?: string;
      releaseDate?: Date;
    },
    generateValueSet?: boolean;
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
    version: {},
    generateValueSet: false,
    source: {
      type: 'link',
      format: 'csv',
      file: undefined
    }
  };

  public analyzeResponse: {properties: FileImportPropertyRow[], request?: FileAnalysisRequest} = {
    properties: []
  };

  public loader = new LoadingManager();
  public validationErrors: string[] = [];
  public jobResponse: JobLog | null = null;

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('jsonFileInput') public jsonFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private codeSystemLibService: CodeSystemLibService,
    private jobService: JobLibService,
    private destroy$: DestroyService,
    private router: Router
  ) {}

  public initCodeSystem(): void {
    this.data.codeSystem = new CodeSystem();
    this.data.codeSystem['_new'] = true;
    this.data.loadedCodeSystem = undefined;
  }


  /* General */

  protected loadCodeSystem(id: string): void {
    this.data.loadedCodeSystem = undefined;
    if (id) {
      this.loader.wrap('cs', this.codeSystemLibService.load(id, true)).subscribe(cs => this.data.loadedCodeSystem = cs);
    }
  }


  /* Source */

  protected analyze(): void {
    const req: FileAnalysisRequest = {
      type: this.data.source.format,
      link: this.data.source.file
    };

    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (this.data.source.type === 'file') {
      fd.append('file', this.fileInput?.nativeElement?.files?.[0] as Blob, 'files');
    }

    this.loader.wrap('analyze', this.http.post<FileAnalysisResponse>(`${this.baseUrl}/analyze`, fd)).subscribe(resp => {
      this.analyzeResponse = {
        request: copyDeep(req),
        properties: (resp.properties || []).map(p => ({
          columnName: p.columnName,
          propertyType: p.columnType,
          propertyTypeFormat: p.columnTypeFormat,
          import: !!p.hasValues
        }))
      };
      this.validationErrors = [];
      this.data.template = undefined;
    });
  }


  /* Properties */

  protected applyTemplate(): void {
    const tpl = IMPORT_TEMPLATES[this.data.template];
    if (!tpl) {
      return;
    }
    const existingProperties = this.combineWithDefaults(this.data.loadedCodeSystem?.properties).map(p => p.name);

    this.analyzeResponse.properties.forEach(ap => {
      const tplProp = tpl.find(tp => tp.columnName === ap.columnName);
      if (tplProp) {
        ap.propertyName = tplProp.propertyName;
        ap.propertyType = tplProp.propertyType;
        ap.propertyTypeFormat = tplProp.propertyTypeFormat;
        ap.preferred = tplProp.preferred;
        ap.lang = tplProp.lang;
        ap.import = tplProp.import;
        ap['_newProp'] = !existingProperties.includes(tplProp.propertyName);
        if (ap.preferred) {
          this.onPropertyPreferredChange(ap);
        }
      }
    });
  }

  private validate(): string[] {
    const errors: string[] = [];
    const props = this.analyzeResponse.properties.filter(p => p.import).filter(p => p.propertyName);
    const propMap = collect(props, p => p.propertyName!);

    const duplicateProperties = Object.keys(propMap).filter(p => propMap[p].length > 1).filter(Boolean);
    if (duplicateProperties.filter(p => p === 'identifier').length) {
      errors.push(`Code system may have only one identifier`);
    }
    if (props.filter(p => p.propertyType === 'date' && isNil(p.propertyTypeFormat)).length) {
      errors.push(`Please select date type property format`);
    }
    return errors;
  }

  protected process(): void {
    if ((this.validationErrors = this.validate()).length) {
      return;
    }

    const req: FileProcessingRequest = {
      // request
      link: this.analyzeResponse.request?.link!,
      type: this.analyzeResponse.request?.type!,
      properties: this.analyzeResponse.properties?.filter(p => p.import),
      generateValueSet: this.data.generateValueSet,

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
        version: this.data.version.version,
        status: this.data.version.status,
        releaseDate: this.data.version.releaseDate
      },
    };


    this.processRequest(req);
  }

  protected processRequest(req: FileProcessingRequest): void {
    const startResponsePolling = (jobId: number): void => {
      const poll$ = new Subject<void>();
      const req$ = timer(0, 3000).pipe(
        takeUntil(merge(this.destroy$, poll$)),
        switchMap(() => this.jobService.getLog(jobId)),
        filter(resp => resp.execution?.status !== 'running')
      );

      this.loader.wrap('process', req$).subscribe(jobResp => {
        poll$.next();
        if (!jobResp.errors && !jobResp.warnings) {
          this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent!, {
            duration: 0,
            closable: true
          });
        }
        this.jobResponse = jobResp;
      });
    };


    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (['csv', 'tsv', 'json'].includes(req.type)) {
      const fileInput = 'json' === req.type ? this.jsonFileInput : this.fileInput;
      fd.append('file', fileInput?.nativeElement?.files?.[0] as Blob, 'files');
    }

    this.jobResponse = null;
    this.loader.wrap('process', this.http.post<JobLogResponse>(`${this.baseUrl}/process`, fd)).subscribe(resp => {
      startResponsePolling(resp.jobId);
    });
  };


  protected onPropertyNameChange(item: FileImportPropertyRow): void {
    const entityProperties = this.combineWithDefaults(this.data.loadedCodeSystem?.properties);
    const grouped = group(entityProperties, p => p.name);

    item.propertyType = grouped[item.propertyName]?.type;
    this.onPropertyTypeChange(item);
  }

  protected onPropertyTypeChange(item: FileImportPropertyRow): void {
    item.propertyTypeFormat = undefined;
  }

  protected onPropertyPreferredChange(item: FileImportPropertyRow): void {
    this.analyzeResponse.properties
      .filter(p => p !== item)
      .forEach(p => p.preferred = false);
  }

  protected combineWithDefaults(entityProperties: EntityProperty[]): EntityProperty[] {
    return Object.values({
      ...group<string, EntityProperty>(DEFAULT_KTS_PROPERTIES, e => e.name!),
      ...group<string, EntityProperty>(entityProperties || [], e => e.name!),
    });
  }

  protected get hasDuplicatedIdentifiers(): boolean {
    return this.analyzeResponse.properties.filter(p => p.propertyName === 'concept-code').length > 1;
  }


  /* Utils */

  protected openCodeSystem(id: string, mode: 'edit' | 'view'): void {
    this.router.navigate(['/resources/code-systems/', id, mode]);
  }

  protected loadCodeSystemVersions = (id): Observable<string[]> => {
    return this.codeSystemLibService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };
}
