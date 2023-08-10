import {Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {JobLibService, JobLog, JobLogResponse} from '../../../../sys/_lib';
import {collect, isNil} from '@kodality-web/core-util';
import {mergeMap, Observable, timer} from 'rxjs';
import {LocalizedName} from '@kodality-web/marina-util';


export interface FileProcessingRequestProperty {
  columnName?: string;
  propertyName?: string;
  propertyType?: string;
  propertyTypeFormat?: string;
  propertyDelimiter?: string;
  preferred?: boolean;
  lang?: string;
}

export interface FileProcessingRequest {
  type?: string;
  link?: string;

  codeSystem?: {
    id?: string;
    uri?: string;
    title?: LocalizedName;
    description?: LocalizedName;
  };
  version?: {
    version?: string;
    status?: string;
    releaseDate?: Date;
  };

  properties?: FileProcessingRequestProperty[];
  generateValueSet?: boolean;
  dryRun?: boolean;
  cleanRun?: boolean
  cleanConceptRun?: boolean
}


export type FileImportPropertyRow = FileProcessingRequestProperty & {
  import: boolean
}

@Injectable()
export class CodeSystemFileImportService {
  public readonly baseUrl = `${environment.termxApi}/file-importer/code-system`;

  public constructor(private http: HttpClient, private jobService: JobLibService) { }

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

  public processRequest(req: FileProcessingRequest, file: Blob, destroy$: Observable<any> = timer(60_000)): Observable<JobLog> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }

    return this.http.post<JobLogResponse>(`${this.baseUrl}/process`, fd).pipe(
      mergeMap(resp => this.jobService.pollFinishedJobLog(resp.jobId, destroy$))
    );
  };
}
