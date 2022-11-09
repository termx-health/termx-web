import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ChefService {

  private http: HttpClient;

  public constructor(httpBackend: HttpBackend) {
    // we don't need auth tokens, so creating new http client
    this.http = new HttpClient(httpBackend);
  }

  //FIXME: add error handling
  public fshToFhir(req: any): Observable<any> {
    return this.http.post(`${environment.chefUrl}/fsh2fhir`, req);
  }

  //FIXME: add error handling
  public fhirToFsh(req: any): Observable<any> {
    return this.http.post(`${environment.chefUrl}/fhir2fsh`, req);
  }
}

//FIXME: add request and response types based on https://fshschool.org/docs/sushi/api/ and https://fshschool.org/docs/gofsh/api/