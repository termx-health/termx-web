import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Space} from 'term-web/space/_lib';

export type WikiSpace = Pick<Space, 'id' | 'code' | 'names' | 'active'>;

@Injectable()
export class WikiSpaceService {
  private baseUrl = `${environment.termxApi}/wiki-spaces`;

  public constructor(private http: HttpClient) { }

  public loadSpaces(): Observable<WikiSpace[]> {
    return this.http.get<WikiSpace[]>(this.baseUrl);
  }
}
