import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from 'environments/environment';
import {SnomedTranslation} from 'term-web/integration/_lib';

@Injectable()
export class SnomedTranslationLibService {
  protected baseUrl = `${environment.terminologyApi}/snomed`;

  public constructor(protected http: HttpClient) { }

  public loadTranslations(conceptId: string): Observable<SnomedTranslation[]> {
    return this.http.get(`${this.baseUrl}/concepts/${conceptId}/translations`).pipe(map(resp => resp as SnomedTranslation[]));
  }

  public load(id: number): Observable<SnomedTranslation> {
    return this.http.get(`${this.baseUrl}/translations/${id}`).pipe(map(resp => resp as SnomedTranslation));
  }
}
