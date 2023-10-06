import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CodeName} from '@kodality-web/marina-util';

@Injectable()
export class WikiSpaceService {
  private baseUrl = `${environment.termxApi}/wiki-spaces`;

  public constructor(private http: HttpClient) { }

  public loadSpaces(): Observable<CodeName[]> {
    return this.http.get<CodeName[]>(this.baseUrl);
  }
}
