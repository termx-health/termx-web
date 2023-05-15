import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from 'environments/environment';
import {SnomedTranslation} from 'term-web/integration/_lib';

@Injectable()
export class SnomedTranslationLibService {
  protected baseUrl = `${environment.terminologyApi}/snomed-translations`;

  public constructor(protected http: HttpClient) { }

  public loadTranslations(conceptId: string): Observable<SnomedTranslation[]> {
    return this.http.get(`${this.baseUrl}/${conceptId}`).pipe(map(resp => resp as SnomedTranslation[]));
  }
}
