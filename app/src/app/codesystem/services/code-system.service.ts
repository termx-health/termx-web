import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CodeSystemLibService} from 'terminology-lib/codesystem/services/code-system-lib.service';
import {CodeSystem} from 'terminology-lib/codesystem';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {EntityProperty} from 'terminology-lib/codesystem/services/entity-property';

@Injectable({providedIn: 'root'})
export class CodeSystemService extends CodeSystemLibService {
  public save(cs: CodeSystem): Observable<any> {
    return this.http.post(this.baseUrl, cs);
  }
  public saveVersion(codeSystemId: string, version: CodeSystemVersion): Observable<any> {
    return this.http.post(`${this.baseUrl}/${codeSystemId}/versions`, version);
  }
  public editVersion(codeSystemId: string, versionId: number, version: CodeSystemVersion): Observable<any> {
    return this.http.put(`${this.baseUrl}/${codeSystemId}/versions/${versionId}`, version);
  }
  public saveProperty(codeSystemId: string, property: EntityProperty): Observable<any> {
    property.created = undefined;
    let propertyInArray: EntityProperty[] = [property];
    return this.http.post(`${this.baseUrl}/${codeSystemId}/properties`, {properties : propertyInArray});//Currently cant post a single property, has to come in object with an array of properties
  }
  public editProperty(codeSystemId: string, versionId: number, version: CodeSystemVersion): Observable<any> {
    return this.http.put(`${this.baseUrl}/${codeSystemId}/versions/${versionId}`, version); // This PUT doesn't exist yet
  }
}
