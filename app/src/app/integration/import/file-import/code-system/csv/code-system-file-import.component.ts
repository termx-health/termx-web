import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {copyDeep, DestroyService, group, LoadingManager, sort} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {of} from 'rxjs';
import {Router} from '@angular/router';
import {CodeSystem, CodeSystemLibService, EntityProperty, ValueSetLibService} from '../../../../../resources/_lib';
import {FileAnalysisRequest, FileAnalysisResponseColumn, FileAnalysisService} from '../../file-analysis.service';
import {JobLibService, JobLog} from 'term-web/sys/_lib';
import {
  CodeSystemFileImportService,
  FileImportPropertyRow,
  FileProcessingRequest
} from 'term-web/resources/_lib/codesystem/services/code-system-file-import.service';


const DEFAULT_KTS_PROPERTIES: EntityProperty[] = [
  {name: 'concept-code', type: 'string', orderNumber: -100},
  {name: 'display', type: 'designation', orderNumber: -50},
  {name: 'definition', type: 'designation', orderNumber: -25},
  {name: 'description', type: 'designation', orderNumber: 9900},
  {name: 'is-a', type: 'string', description: 'association', orderNumber: 9999},
];


@Component({
  templateUrl: 'code-system-file-import.component.html',
  providers: [DestroyService, CodeSystemFileImportService]
})
export class CodeSystemFileImportComponent implements OnInit {
  public breadcrumbs = ['web.integration.file-import.title', 'web.integration.file-import.code-system.import'];

  public sourceCodeSystem: CodeSystem;

  public data: {
    // general
    codeSystem: CodeSystem,
    codeSystemVersion?: {
      version?: string;
      status?: string;
      releaseDate?: Date;
    },
    generateValueSet?: boolean;
    dryRun?: boolean;
    cleanRun?: boolean
    cleanConceptRun?: boolean
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
    dryRun: true,
    cleanRun: false,
    cleanConceptRun: false,
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

  public dataTypes: string[];

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('jsonFileInput') public jsonFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private codeSystemLibService: CodeSystemLibService,
    private valueSetLibService: ValueSetLibService,
    private importService: CodeSystemFileImportService,
    private fileAnalysisService: FileAnalysisService,
    private jobService: JobLibService,
    private destroy$: DestroyService,
    private router: Router
  ) {}


  public ngOnInit(): void {
    this.valueSetLibService.expand({valueSet: 'concept-property-type'})
      .subscribe(concepts => this.dataTypes = [...concepts.map(c => c.concept.code), 'designation']);
  }

  protected analyze(): void {
    const req: FileAnalysisRequest = {
      type: this.data.source.format,
      link: this.data.source.file
    };

    const file: Blob = this.data.source.type === 'file'
      ? this.fileInput?.nativeElement?.files?.[0]
      : undefined;

    this.loader.wrap('analyze', this.fileAnalysisService.analyze(req, file)).subscribe(({columns}) => {
      const toPropertyRow = (p: FileAnalysisResponseColumn): FileImportPropertyRow => ({
        columnName: p.columnName,
        propertyType: p.columnType,
        propertyTypeFormat: p.columnTypeFormat,
        import: !!p.hasValues
      });

      this.analyzeResponse = {
        origin: copyDeep(req),
        parsedProperties: columns?.map(toPropertyRow) ?? []
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
      cleanConceptRun: this.data.cleanConceptRun,

      // meta
      codeSystem: {
        id: this.data.codeSystem.id,
        ...(this.data.codeSystem['_new'] && {
          uri: this.data.codeSystem.uri,
          title: this.data.codeSystem.title,
          description: this.data.codeSystem.description,
        })
      },
      version: {
        version: this.data.codeSystemVersion.version,
        status: this.data.codeSystemVersion.status,
        releaseDate: this.data.codeSystemVersion.releaseDate,
      },
    };

    let file: Blob;
    if (['csv', 'tsv', 'json'].includes(req.type)) {
      const fileInput = 'json' === req.type
        ? this.jsonFileInput
        : this.fileInput;
      file = fileInput?.nativeElement?.files?.[0];
    }


    this.processRequest(req, file);
  }

  protected processRequest(req: FileProcessingRequest, file: Blob): void {
    this.jobLog = undefined;
    this.loader.wrap('process', this.importService.processRequest(req, file, this.destroy$)).subscribe(resp => {
      this.jobLog = resp;
      if (resp.errors?.length || resp.warnings?.length) {
        this.downloadLog();
      } else if (!this.data.dryRun) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent!, {duration: 0, closable: true});
      }
    });
  };

  protected downloadLog(): void {
    const warnings = this.jobLog.warnings?.join('\n');
    const errors = this.jobLog.errors?.join('\n');

    const file = [
      warnings,
      errors
    ].filter(Boolean).join('\n\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
    element.setAttribute('download', ['log', this.data.codeSystem.id].filter(Boolean).join('_') + '.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }


  /* Parsed properties table */
  protected applyTemplate(): void {
    const existingPropertyNames = this.combineWithDefaults(this.sourceCodeSystem?.properties).map(p => p.name);
    const req$ = this.data.template ? this.http.get<FileImportPropertyRow[]>(`./assets/file-import-templates/${this.data.template}.json`) : of([]);

    req$.subscribe(resp => {
      const template = group(resp, p => p.columnName);
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
    });

  }

  protected onPropertyNameChange(item: FileImportPropertyRow): void {
    const entityProperties = this.combineWithDefaults(this.sourceCodeSystem?.properties);
    const grouped = group(entityProperties, p => p.name);

    item.propertyType = grouped[item.propertyName]?.kind === 'designation' ? 'designation' : grouped[item.propertyName]?.type;
    this.onPropertyTypeChange(item);
  }

  protected onPropertyTypeChange(item: FileImportPropertyRow): void {
    item.propertyTypeFormat = undefined;
  }

  protected onPropertyPreferredChange(item: FileImportPropertyRow): void {
    this.analyzeResponse.parsedProperties.filter(p => p !== item).forEach(p => p.preferred = false);
  }

  protected combineWithDefaults(entityProperties: EntityProperty[]): EntityProperty[] {
    return sort(Object.values({
      ...group<string, EntityProperty>(DEFAULT_KTS_PROPERTIES, e => e.name!),
      ...group<string, EntityProperty>(entityProperties || [], e => e.name!),
    }), 'orderNumber');
  }

  protected get hasDuplicateIdentifiers(): boolean {
    return this.analyzeResponse.parsedProperties.filter(p => p.propertyName === 'concept-code').length > 1;
  }


  /* Utils */

  protected openCodeSystem(id: string): void {
    this.router.navigate(['/resources/code-systems', id, 'summary']);
  }

}