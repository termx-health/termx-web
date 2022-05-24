import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IntegrationFhirLibService} from 'terminology-lib/integration/services/integration-fhir-lib-service';


interface IntegrationImportRequest {
  parameter: {valueString: string; name: string}[]
}

@Injectable()
export class IntegrationFhirService extends IntegrationFhirLibService {

  public import(source: string, urls: IntegrationImportRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${source}/$sync`, urls);
  }
}