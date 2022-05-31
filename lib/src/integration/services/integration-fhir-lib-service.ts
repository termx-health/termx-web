import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class IntegrationFhirLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/fhir`;
  }

  public getCodeSystem(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/CodeSystem/${id}`);
  }
}
