import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IntegrationFhirLibService} from 'terminology-lib/integration/services/integration-fhir-lib-service';


class IntegrationSyncParameters {
  public parameter?: IntegrationSyncParameter[];
}

class IntegrationSyncParameter {
  public name?: string;
  public valueDecimal?: number;
  public valueString?: string;
}


@Injectable()
export class IntegrationFhirService extends IntegrationFhirLibService {

  public import(source: string, urls: IntegrationSyncParameters): Observable<IntegrationSyncParameters> {
    return this.http.post<IntegrationSyncParameters>(`${this.baseUrl}/${source}/$sync`, urls);
  }
}