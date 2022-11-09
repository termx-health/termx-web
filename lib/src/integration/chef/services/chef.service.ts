import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {environment} from '../../../../../app/src/environments/environment';
import {FshToFhirRequest} from '../model/fsh-to-fhir-request';
import {FhirToFshRequest} from '../model/fhir-to-fsh-request';
import {FshToFhirResponse} from '../model/fsh-to-fhir-response';
import {FhirToFshResponse} from '../model/fhir-to-fsh-response';

@Injectable()
export class ChefService {

  private http: HttpClient;

  public constructor(httpBackend: HttpBackend) {
    // we don't need auth tokens, so creating new http client
    this.http = new HttpClient(httpBackend);
  }

  public fshToFhir(req: FshToFhirRequest): Observable<FshToFhirResponse> {
    return this.http.post(`${environment.chefUrl}/fsh2fhir`, req).pipe(catchError(err => of(err.error)));
  }

  public fhirToFsh(req: FhirToFshRequest): Observable<FhirToFshResponse> {
    return this.http.post(`${environment.chefUrl}/fhir2fsh`, req).pipe(catchError(err => of(err.error)));
  }
}
