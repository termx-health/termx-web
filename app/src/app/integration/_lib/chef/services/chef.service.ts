import {HttpBackend, HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {catchError, Observable, of} from 'rxjs';
import {FhirToFshRequest} from '../model/fhir-to-fsh-request';
import {FhirToFshResponse} from '../model/fhir-to-fsh-response';
import {FshToFhirRequest} from '../model/fsh-to-fhir-request';
import {FshToFhirResponse} from '../model/fsh-to-fhir-response';

@Injectable()
export class ChefService {
  private http: HttpClient;

  public constructor(httpBackend: HttpBackend) {
    // we don't need auth tokens, so creating new http client
    this.http = new HttpClient(httpBackend);
  }

  public fshToFhir(req: FshToFhirRequest): Observable<FshToFhirResponse> {
    const chefFhirVersion = `${environment.chefFhirVersion}`;
    req.options ??= {};
    req.options.fhirVersion ??= chefFhirVersion || '5.0.0';
    return this.http.post(`${environment.chefUrl}/fsh2fhir`, req).pipe(catchError(err => of(err.error)));
  }

  public fhirToFsh(req: FhirToFshRequest, version: string = '5.0.0'): Observable<FhirToFshResponse> {
    const igResource = {
      resourceType: 'ImplementationGuide',
      fhirVersion: [version],
      id: '1',
      url: `${environment.termxApi}/fhir/ImplementationGuide/1` ,
      version: '1.0.0'
    };
    req.fhir.push(JSON.stringify(igResource, null, 2));
    return this.http.post(`${environment.chefUrl}/fhir2fsh`, req).pipe(catchError(err => of(err.error)));
  }
}
