import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IntegrationFhirLibService} from 'terminology-lib/integration/services/integration-fhir-lib-service';


class FhirSyncParameters {
  public parameter?: FhirSyncParameter[];
}

class FhirSyncParameter {
  public name?: string;
  public valueDecimal?: number;
  public valueString?: string;
}


@Injectable()
export class IntegrationFhirService extends IntegrationFhirLibService {

  public import(source: string, urls: FhirSyncParameters): Observable<FhirSyncParameters> {
    return this.http.post<FhirSyncParameters>(`${this.baseUrl}/${source}/$sync`, urls);
  }
}