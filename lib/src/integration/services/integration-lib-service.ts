import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class IntegrationLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}`;
  }
}
