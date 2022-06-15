import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {FhirSyncParameters} from '../../model/fhir-sync-parameters';
import {Observable} from 'rxjs';

@Injectable()
export class FhirValueSetLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir/ValueSet`;
  }

  public import(urls: FhirSyncParameters): Observable<FhirSyncParameters> {
    return this.http.post<FhirSyncParameters>(`${this.baseUrl}/$sync`, urls);
  }
}
