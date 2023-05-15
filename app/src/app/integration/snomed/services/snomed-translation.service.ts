import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SnomedTranslation, SnomedTranslationLibService} from 'app/src/app/integration/_lib';


@Injectable()
export class SnomedTranslationService extends SnomedTranslationLibService {
  public save(conceptId: string, translations: SnomedTranslation[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${conceptId}`, translations);
  }
}
