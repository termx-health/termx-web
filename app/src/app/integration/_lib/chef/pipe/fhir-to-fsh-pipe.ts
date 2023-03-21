import {Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ChefService} from '../services/chef.service';
import {MuiNotificationService} from '@kodality-web/marina-ui';

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
      resp.warnings?.forEach(w => this.notificationService.warning('Conversion warning', w.message!, {duration: 0, closable: true}));
      resp.errors?.forEach(e => this.notificationService.error('Conversion failed!', e.message!, {duration: 0, closable: true}));
      return typeof resp.fsh === 'string' ? resp.fsh : JSON.stringify(resp.fsh, null, 2);
    }));
  }
}
