import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from 'environments/environment';
import {FhirToUmlRequest} from '../model/fhir-to-uml-request';
import {FhirToUmlResponse} from '../model/fhir-to-uml-response';

@Injectable({providedIn: 'root'})
export class FhirUmlConverterService {
  private http: HttpClient;

  public constructor(httpBackend: HttpBackend) {
    // The fhir2uml converter is an external service with no termx auth — use a bare HttpClient
    // (built off HttpBackend) so the auth interceptor doesn't attach a bearer token.
    this.http = new HttpClient(httpBackend);
  }

  public fhirToUml(req: FhirToUmlRequest): Observable<FhirToUmlResponse> {
    const contentType = req.exportAs === 'PNG' ? 'image/png'
      : req.exportAs === 'SVG' ? 'image/svg+xml'
        : 'text/plain';

    const headers = new HttpHeaders({
      'Accept': `application/json; view=${req.view}`,
      'Content-Type': contentType,
      'X-Hide-Removed-Objects': String(req.hideRemovedObjects),
      'X-Show-Constraints': String(req.showConstraints),
      'X-Show-Bindings': String(req.showBindings),
      'X-Reduce-Slice-Classes': String(req.reduceSliceClasses),
      'X-Hide-Legend': String(req.hideLegend)
    });

    return this.http.post(`${environment.fhirUmlConverterApi}/fhir2uml`, req.payload, {
      headers,
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => ({
        body: r.body!,
        contentType: r.headers.get('Content-Type') ?? ''
      } as FhirToUmlResponse)),
      catchError(err => throwError(() => err))
    );
  }
}
