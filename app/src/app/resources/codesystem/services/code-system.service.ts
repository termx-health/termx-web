import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystem, CodeSystemLibService, CodeSystemVersion} from 'terminology-lib/resources';

@Injectable()
export class CodeSystemService extends CodeSystemLibService {
  public save(cs: CodeSystem): Observable<any> {
    return this.http.post(this.baseUrl, cs);
  }

  public saveVersion(codeSystemId: string, version: CodeSystemVersion): Observable<CodeSystemVersion> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/versions`, version);
  }
}
