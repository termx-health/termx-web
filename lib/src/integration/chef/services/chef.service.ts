import {Inject, Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {FshToFhirRequest} from '../model/fsh-to-fhir-request';
import {FhirToFshRequest} from '../model/fhir-to-fsh-request';
import {FshToFhirResponse} from '../model/fsh-to-fhir-response';
import {FhirToFshResponse} from '../model/fhir-to-fsh-response';
import {TERMINOLOGY_CHEF_URL} from '../../../terminology-lib.config';

@Injectable()
export class ChefService {

  private http: HttpClient;

  public constructor(@Inject(TERMINOLOGY_CHEF_URL) private api: string, httpBackend: HttpBackend) {
    // we don't need auth tokens, so creating new http client
    this.http = new HttpClient(httpBackend);
  }

  public fshToFhir(req: FshToFhirRequest): Observable<FshToFhirResponse> {
    return this.http.post(`${this.api}/fsh2fhir`, req).pipe(catchError(err => of(err.error)));
  }

  public fhirToFsh(req: FhirToFshRequest): Observable<FhirToFshResponse> {
    return this.http.post(`${this.api}/fhir2fsh`, req).pipe(catchError(err => of(err.error)));
  }
}
