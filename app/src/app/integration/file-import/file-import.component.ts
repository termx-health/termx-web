import {Component, ElementRef, ViewChild} from '@angular/core';
import {CodeSystem} from 'terminology-lib/resources';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {copyDeep} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {LocalizedName} from '@kodality-health/marina-util';


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

    const formData = new FormData();
    formData.append('request', JSON.stringify(req));

    if (this.data.source.type === 'file') {
      // formData.append('file', this.fileInput?.nativeElement?.files?.[0] as Blob);
    }

    this.loading['analyze'] = true;
    this.http.post<FileAnalysisResponse>(`${environment.terminologyApi}/file-importer/analyze`, req).subscribe(resp => {
      this.analyzeResponse = {
        request: copyDeep(req),
        properties: (resp.properties || []).map(p => ({
          columnName: p.columnName,
          mappedProperty: p.mappedProperty,
          propertyType: p.propertyType,
          typeFormat: p.typeFormat,
          import: !!p.hasValues
        }))
      };
    }).add(() => this.loading['analyze'] = false);
  }

  public process(): void {
    const req: FileProcessingRequest = {
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

      // request
      link: this.analyzeResponse.request?.link!,
      type: this.analyzeResponse.request?.type!,
      template: this.analyzeResponse.request?.template!,
      properties: this.analyzeResponse.properties?.filter(p => p.import)
    };

    this.loading['process'] = true;
    this.http.post<any>(`${environment.terminologyApi}/file-importer/process`, req)
      .subscribe(console.log)
      .add(() => this.loading['process'] = false);
  }
}
