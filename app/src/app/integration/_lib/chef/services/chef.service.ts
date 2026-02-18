import {HttpBackend, HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {catchError, Observable, of} from 'rxjs';
import {FhirToFshRequest} from 'term-web/integration/_lib/chef/model/fhir-to-fsh-request';
import {FhirToFshResponse} from 'term-web/integration/_lib/chef/model/fhir-to-fsh-response';
import {FshToFhirRequest} from 'term-web/integration/_lib/chef/model/fsh-to-fhir-request';
import {FshToFhirResponse} from 'term-web/integration/_lib/chef/model/fsh-to-fhir-response';

@Injectable()
export class ChefService {
  private http: HttpClient;

  public constructor() {
    const httpBackend = inject(HttpBackend);

    // we don't need auth tokens, so creating new http client
    this.http = new HttpClient(httpBackend);
  }

  public fshToFhir(req: FshToFhirRequest): Observable<FshToFhirResponse> {
    req.options ??= {};
    req.options.fhirVersion ??= '5.0.0';
    return this.http.post(`${environment.chefUrl}/fsh2fhir`, req).pipe(catchError(err => of(err.error)));
  }

  public fhirToFsh(req: FhirToFshRequest): Observable<FhirToFshResponse> {
    const igResource = {
      resourceType: 'ImplementationGuide',
      fhirVersion: ['5.0.0'],
      id: '1',
      url: `${environment.termxApi}/fhir/ImplementationGuide/1` ,
      version: '1.0.0'
    };
    req.fhir.push(JSON.stringify(igResource, null, 2));
    return this.http.post(`${environment.chefUrl}/fhir2fsh`, req).pipe(catchError(err => of(err.error)));
  }
}
