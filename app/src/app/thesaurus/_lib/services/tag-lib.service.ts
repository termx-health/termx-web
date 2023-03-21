import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {Tag} from '../model/tag';

@Injectable()
export class TagLibService {
  protected baseUrl = environment.terminologyApi;

  public constructor(protected http: HttpClient) { }

  public loadAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }
}
