import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {RelatedArtifact} from 'term-web/resources/_lib/related-artifacts';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';

@Injectable()
export class RelatedArtifactLibService {
  protected http = inject(HttpClient);

  protected baseUrl = `${environment.termxApi}/related-artifacts`;

  public findRelatedArtifacts(type: string, id: string): Observable<RelatedArtifact[]> {
    return this.http.post<RelatedArtifact[]>(`${this.baseUrl}`, {type: type, id: id});
  }
}
