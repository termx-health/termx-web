import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeSystemConcept} from '../model/code-system-concept';


@Injectable()
export class ConceptLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/ts/concepts`;
  }

  public load(conceptId: number): Observable<CodeSystemConcept> {
    return this.http.get<CodeSystemConcept>(`${this.baseUrl}/${conceptId}`);
  }
}
