import {ValueSetLibService} from 'terminology-lib/valueset/services/value-set-lib.service';
import {Injectable} from '@angular/core';
import {ValueSet} from 'terminology-lib/valueset/services/value-set';
import {Observable} from 'rxjs';
import {ValueSetVersion} from 'terminology-lib/valueset/services/value-set-version';

@Injectable({providedIn: 'root'})
export class ValueSetService extends ValueSetLibService {
  public save(valueSet: ValueSet): Observable<any> {
    return this.http.post(this.baseUrl, valueSet);
  }

  public saveVersion(valueSetId: string, version: ValueSetVersion): Observable<any> {
    if (version.id && version.version) {
      return this.http.put(`${this.baseUrl}/${valueSetId}/versions/${version.id}`, version);
    }
    return this.http.post(`${this.baseUrl}/${valueSetId}/versions`, version);
  }

  public activateVersion(valueSetId: string, version: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${valueSetId}/versions/${version}/activate`, {});
  }

  public retireVersion(valueSetId: string, version: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${valueSetId}/versions/${version}/retire`, {});
  }
}