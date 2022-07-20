import {Component, ElementRef, ViewChild} from '@angular/core';
import {CodeSystem} from 'terminology-lib/resources';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {collect, copyDeep, isNil, join} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {LocalizedName} from '@kodality-health/marina-util';

// @ts-ignore
const IMPORT_TEMPLATES = {
  'pub.e-tervis': {}
};


const KTS_PROPERTIS = [
  "identifier",
  "alias",
  "display",
  "designation",
  "parent",
  "level",
  "validFrom",
  "validTo",
  "status",
  "description",
  "modifiedAt"
]

// analysis
interface FileAnalysisRequest {
  link: string;
  type: string;
  template: string;
}

interface FileAnalysisResponse {
  properties?: FileAnalysisResponseProperty[];
}

interface FileAnalysisResponseProperty {
  columnName?: string;
  mappedProperty?: string;
  propertyType?: string;
  typeFormat?: string;
  hasValues?: boolean;
}

// processing
interface FileProcessingRequest {
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
  generateValueSet?: boolean;

  link: string;
  type: string;
  template: string;
  properties?: FileProcessingRequestProperty[];
}

interface FileProcessingRequestProperty {
  columnName?: string;
  mappedProperty?: string;
  propertyType?: string;
  typeFormat?: string;
  lang?: string;
}


@Component({
  templateUrl: 'file-import.component.html'
})
export class FileImportComponent {
  public analyzeResponse: {
    properties: (FileAnalysisResponseProperty & {import: boolean})[],
    request?: FileAnalysisRequest
  } = {
    properties: []
  };

  public loading: {[k: string]: boolean} = {};
  public validationErrors: string[] = [];

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

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;

  public constructor(private http: HttpClient) {}

  public initCodeSystem(): void {
    this.data.codeSystem = new CodeSystem();
    this.data.codeSystem['_new'] = true;
  }

  public analyze(): void {
    const req: FileAnalysisRequest = {
      link: this.data.source.file,
      type: this.data.source.mode,
      template: this.data.template
    };

    this.loading['analyze'] = true;
    this.http.post<FileAnalysisResponse>(`${environment.terminologyApi}/file-importer/analyze`, req).subscribe(resp => {
      this.validationErrors = [];
      this.analyzeResponse = {
        request: copyDeep(req),
        properties: (resp.properties || []).map(p => ({
          columnName: p.columnName,
          mappedProperty: this.ktsProps.includes(p.mappedProperty!) ? p.mappedProperty : undefined,
          propertyType: p.propertyType,
          typeFormat: p.typeFormat,
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
      template: this.analyzeResponse.request?.template!,
      properties: this.analyzeResponse.properties?.filter(p => p.import),

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
      generateValueSet: this.data.generateValueSet,
    };


    this.loading['process'] = true;
    this.http.post<void>(`${environment.terminologyApi}/file-importer/process`, req).subscribe(() => {
      console.log("success")
    }).add(() => this.loading['process'] = false);
  }

  private validate(): string[] {
    const errors: string[] = [];
    const props = this.analyzeResponse.properties.filter(p => p.import);
    const propMap = collect(props, p => p.mappedProperty!);

    if (props.filter(p => isNil(p.mappedProperty)).length) {
      errors.push(`Please specify code system properties`);
    }
    const duplicateProperties = Object.keys(propMap).filter(p => propMap[p].length > 1).filter(Boolean);
    if (duplicateProperties.filter(p => p === 'identifier').length) {
      errors.push(`Code system may have only one identifier`);
    }
    if (duplicateProperties.length > 0) {
      errors.push(`Duplicate KTS properties found: ${join(duplicateProperties, ', ')}`);
    }
    if (props.filter(p => p.propertyType === 'date' && isNil(p.typeFormat)).length) {
      errors.push(`Please select date type property format`);
    }
    return errors;
  }


  public get ktsProps(): string[] {
    return KTS_PROPERTIS;
  }
}
