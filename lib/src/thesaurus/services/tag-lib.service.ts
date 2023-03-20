import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TERMINOLOGY_API_URL} from '../../terminology-lib.config';
import {Tag} from '../model/tag';

@Injectable()
export class TagLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API_URL) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}`;
  }

  public loadAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }
}
