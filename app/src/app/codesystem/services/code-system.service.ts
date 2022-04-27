import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystemLibService} from 'terminology-lib/codesystem/services/code-system-lib.service';
import {CodeSystem} from 'terminology-lib/codesystem';

@Injectable({providedIn: 'root'})
export class CodeSystemService extends CodeSystemLibService {
  public save(cs: CodeSystem): Observable<any> {
    return this.http.post(this.baseUrl, cs);
  }
}
