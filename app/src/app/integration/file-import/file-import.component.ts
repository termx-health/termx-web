import {Component, ElementRef, ViewChild} from '@angular/core';
import {CodeSystem, CodeSystemLibService, EntityProperty} from 'terminology-lib/resources';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {collect, copyDeep, group, isNil} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {LocalizedName} from '@kodality-health/marina-util';
import {MuiNotificationService} from '@kodality-health/marina-ui';

// @ts-ignore
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
      lang: 'est',
      import: false
    },
    {
      columnName: 'Nimetus',
      propertyName: 'display',
      propertyType: 'string',
      lang: 'est',
      import: true
    },
    {
      columnName: 'Pikk_nimetus',
      propertyName: 'designation',
      propertyType: 'string',
      lang: 'est',
      import: true
    },
    {
      columnName: 'Vanem_kood',
      propertyName: 'parent',
      propertyType: 'string',
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
      propertyType: 'string',
      propertyTypeFormat: 'dd.MM.yyyy',
      import: true
    },
    {
      columnName: 'Staatus',
      propertyName: 'status',
      propertyType: 'string',
      lang: 'est',
      import: true
    },
    {
      columnName: 'Selgitus',
      propertyName: 'description',
      propertyType: 'string',
      lang: 'est',
      import: false
    }
  ]
};

const DEFAULT_KTS_PROPERTIES: EntityProperty[] = [
  {name: 'concept-code', type: 'string'},
  {name: 'description', type: 'string'},
  {name: 'definition', type: 'string'},
  {name: 'display', type: 'string'}
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
  link: string;
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
    version: string;
    status: string;
    releaseDate: Date;
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
  templateUrl: 'file-import.component.html'
})
export class FileImportComponent {
  public analyzeResponse: {
    properties: FileImportPropertyRow[],
    request?: FileAnalysisRequest
  } = {
    properties: []
  };

  public data: any = {
    codeSystem: {},
    version: {},
    generateValueSet: false,
    source: {
      type: 'link',
      file: 'https://pub.e-tervis.ee/classifications/Diagnoosi%20liik/3/3.csv',
      mode: 'csv'
    }
  };

  public loading: {[k: string]: boolean} = {};
  public validationErrors: string[] = [];


  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private codeSystemLibService: CodeSystemLibService
  ) {}

  public initCodeSystem(): void {
    this.data.codeSystem = new CodeSystem();
    this.data.codeSystem['_new'] = true;
    this.data.loadedCodeSystem = undefined;
  }

  public analyze(): void {
    const req: FileAnalysisRequest = {
      type: this.data.source.mode,
      link: this.data.source.file
    };

    this.loading['analyze'] = true;
    this.http.post<FileAnalysisResponse>(`${environment.terminologyApi}/file-importer/analyze`, req).subscribe(resp => {
      this.validationErrors = [];
      this.data.template = undefined;
      this.analyzeResponse = {
        request: copyDeep(req),
        properties: (resp.properties || []).map(p => ({
          columnName: p.columnName,
          propertyType: p.columnType,
          propertyTypeFormat: p.columnTypeFormat,
          import: !!p.hasValues
        }))
      };
    }).add(() => this.loading['analyze'] = false);
  }

  public process(): void {
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


    this.loading['process'] = true;
    this.http.post<void>(`${environment.terminologyApi}/file-importer/process`, req).subscribe(() => {
      this.notificationService.success("File processing is finished");
    }).add(() => this.loading['process'] = false);
  }


  public applyTemplate(): void {
    const tpl = IMPORT_TEMPLATES[this.data.template];
    if (!tpl) {
      return;
    }
    const existingProperties = this.decorateWithDefaultProperties(this.data.loadedCodeSystem?.properties).map(p => p.name);

    this.analyzeResponse.properties.forEach(ap => {
      const tplProp = tpl.find(tp => tp.columnName === ap.columnName);
      if (tplProp) {
        ap.propertyName = tplProp.propertyName;
        ap.propertyType = tplProp.propertyType;
        ap.propertyTypeFormat = tplProp.propertyTypeFormat;
        ap.preferred = tplProp.preferred;
        ap.import = tplProp.import;
        (ap as any)['_newProp'] = !existingProperties.includes(tplProp.propertyName);
        this.onPreferredChange(ap);
      }
    });
  }


  public loadCodeSystem(id: string): void {
    this.data.loadedCodeSystem = undefined;
    if (id) {
      this.loading['cs'] = true;
      this.codeSystemLibService.load(id, true).subscribe(cs => {
        this.data.loadedCodeSystem = cs;
      }).add(() => this.loading['cs'] = false);
    }
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


  public onPropertyNameChange(item: FileImportPropertyRow): void {
    const properties: EntityProperty[] = this.decorateWithDefaultProperties(this.data.loadedCodeSystem?.properties);

    item.propertyType = properties.find(p => p.name === item.propertyName)?.type;
    this.onPropertyTypeChange(item);
  }

  public onPropertyTypeChange(item: FileImportPropertyRow): void {
    item.propertyTypeFormat = undefined;
  }

  public onPreferredChange(item: FileImportPropertyRow): void {
    this.analyzeResponse.properties.filter(p => p !== item).forEach(p => p.preferred = false);
  }

  public get hasAnyIdentifierRow(): boolean {
    return this.analyzeResponse.properties.filter(p => p.propertyName === 'concept-code').length > 1;
  }

  public decorateWithDefaultProperties(entityProperties: EntityProperty[]): EntityProperty[] {
    return Object.values({
      ...group(DEFAULT_KTS_PROPERTIES, e => e.name!),
      ...group(entityProperties || [], e => e.name!),
    });
  }
}
