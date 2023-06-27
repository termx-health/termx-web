import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {RelatedArtifact} from 'term-web/resources/_lib/relatedartifacts';

@Injectable()
export class RelatedArtifactLibService {
  protected baseUrl = `${environment.termxApi}/related-artifacts`;

  public constructor(protected http: HttpClient) { }

  public findRelatedArtifacts(type: string, id: string): Observable<RelatedArtifact[]> {
    return this.http.post<RelatedArtifact[]>(`${this.baseUrl}`, {type: type, id: id});
  }
}
