import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PackageVersionLibService} from 'term-web/project/_lib';

@Injectable()
export class PackageVersionService extends PackageVersionLibService {
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
