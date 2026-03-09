import {HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Tag} from 'term-web/wiki/_lib/tag/models/tag';

@Injectable()
export class TagLibService {
  protected http = inject(HttpClient);

  protected baseUrl = environment.termxApi;

  public loadAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }
}
