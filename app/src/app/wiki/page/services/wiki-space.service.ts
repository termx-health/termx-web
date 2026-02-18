import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {Observable} from 'rxjs';
import {Space} from 'term-web/sys/_lib/space';
import {environment} from 'environments/environment';

export type WikiSpace = Pick<Space, 'id' | 'code' | 'names' | 'active'>;

@Injectable()
export class WikiSpaceService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.termxApi}/wiki-spaces`;

  public loadSpaces(): Observable<WikiSpace[]> {
    return this.http.get<WikiSpace[]>(this.baseUrl);
  }
}
