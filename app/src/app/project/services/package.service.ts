import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PackageLibService} from 'term-web/project/_lib';

@Injectable()
export class PackageService extends PackageLibService {
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
