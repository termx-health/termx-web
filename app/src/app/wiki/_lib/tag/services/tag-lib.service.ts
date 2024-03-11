import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Tag} from '../models/tag';

@Injectable()
export class TagLibService {
  protected baseUrl = environment.termxApi;

  public constructor(protected http: HttpClient) { }

  public loadAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }
}
