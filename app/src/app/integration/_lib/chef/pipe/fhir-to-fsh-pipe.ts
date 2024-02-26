import {Pipe, PipeTransform} from '@angular/core';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ChefService} from '../services/chef.service';

@Pipe({
  name: 'fhirToFsh'
})
export class FhirToFshPipe implements PipeTransform {

  public constructor(
    private chefService: ChefService,
    private notificationService: MuiNotificationService
  ) {}

  public transform(content: string): Observable<string> {
    if (!content) {
      return EMPTY;
    }

    return this.chefService.fhirToFsh({fhir: [content]}).pipe(map(resp => {
      resp.warnings?.forEach(w => this.notificationService.warning('FHIR to FSH conversion warning', w.message!, {duration: 0, closable: true}));
      resp.errors?.forEach(e => this.notificationService.error('FHIR to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
      return typeof resp.fsh === 'string' ? resp.fsh : JSON.stringify(resp.fsh, null, 2);
    }));
  }
}
