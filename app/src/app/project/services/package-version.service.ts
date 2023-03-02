import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PackageVersionLibService} from 'terminology-lib/project';

@Injectable()
export class PackageVersionService extends PackageVersionLibService {
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
