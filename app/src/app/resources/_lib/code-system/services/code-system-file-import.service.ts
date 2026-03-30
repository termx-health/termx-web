import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {collect, isNil} from '@termx-health/core-util';
import {LocalizedName} from '@termx-health/util';
import {mergeMap, Observable, timer} from 'rxjs';
import {environment} from 'environments/environment';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';


export interface FileProcessingRequestProperty {
  columnName?: string;
  propertyName?: string;
  propertyType?: string;
  propertyTypeFormat?: string;
  propertyCodeSystem?: string;
  propertyDelimiter?: string;
  preferred?: boolean;
  language?: string;
}

export interface FileProcessingRequest {
  type?: string;
  link?: string;

  codeSystem?: {
    id?: string;
    uri?: string;
    title?: LocalizedName;
    description?: LocalizedName;
    supplement?: string;
  };
  version?: {
    number?: string;
    status?: string;
    releaseDate?: Date | string;
    supplementVersion?: string;
  };

  properties?: FileProcessingRequestProperty[];
  generateValueSet?: boolean;
  dryRun?: boolean;
  cleanVersion?: boolean
  replaceConcept?: boolean
}


export type FileImportPropertyRow = FileProcessingRequestProperty & {
  import: boolean
}

@Injectable()
export class CodeSystemFileImportService {
  private http = inject(HttpClient);
  private jobService = inject(JobLibService);

  public readonly baseUrl = `${environment.termxApi}/file-importer/code-system`;

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

    // const forbiddenNewProperties = props.filter(p => ['code', 'Coding'].includes(p.propertyType) && p['_newProp']);
    // if (forbiddenNewProperties.length) {
    //   errors.push(`Please create code system and define ${forbiddenNewProperties.map(p => `"${p.propertyName}"`).join(', ')} properties there`);
    // }

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
