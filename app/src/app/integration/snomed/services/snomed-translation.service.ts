import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SnomedTranslation, SnomedTranslationLibService} from 'app/src/app/integration/_lib';
import {Provenance} from 'term-web/sys/_lib';


@Injectable()
export class SnomedTranslationService extends SnomedTranslationLibService {

  public save(conceptId: string, translations: SnomedTranslation[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/concepts/${conceptId}/translations`, translations);
  }

  public addToBranch(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/translations/${id}/add-to-branch`, null);
  }

  public loadProvenances(conceptId: string): Observable<Provenance[]> {
    return this.http.get<Provenance[]>(`${this.baseUrl}/concepts/${conceptId}/provenances`);
  }
}
