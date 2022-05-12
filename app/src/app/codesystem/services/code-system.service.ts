import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystemLibService} from 'terminology-lib/codesystem/services/code-system-lib.service';
import {CodeSystem} from 'terminology-lib/codesystem';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';

@Injectable({providedIn: 'root'})
export class CodeSystemService extends CodeSystemLibService {
  public save(cs: CodeSystem): Observable<any> {
    return this.http.post(this.baseUrl, cs);
  }

  public saveVersion(codeSystemId: string, version: CodeSystemVersion): Observable<any> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${codeSystemId}/versions/${version.version}`, version);
    }
    return this.http.post(`${this.baseUrl}/${codeSystemId}/versions`, version);
  }
}
