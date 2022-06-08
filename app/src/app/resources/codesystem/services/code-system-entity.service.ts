import {Injectable} from '@angular/core';
import {CodeSystemEntityLibService, CodeSystemEntityVersion} from 'terminology-lib/resources';
import {Observable} from 'rxjs';

@Injectable()
export class CodeSystemEntityService extends CodeSystemEntityLibService {
  public saveVersion(conceptId: number, entityVersion: CodeSystemEntityVersion): Observable<CodeSystemEntityVersion> {
    if (entityVersion.id) {
      return this.http.put(`${this.baseUrl}/${conceptId}/versions/${entityVersion.id}`, entityVersion);
    }
    return this.http.post(`${this.baseUrl}/${conceptId}/versions`, entityVersion);
  }
}