import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PackageLibService} from 'term-web/space/_lib';

@Injectable()
export class PackageService extends PackageLibService {
  public delete(spaceId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${spaceId}/packages/${id}`);
  }

  public deleteVersion(spaceId: number, packageId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${spaceId}/packages/${packageId}/versions/${id}`);
  }
}
