import {Pipe, PipeTransform} from '@angular/core';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ChefService} from '../services/chef.service';

@Pipe({
  name: 'fshToFhir'
})
export class FshToFhirPipe implements PipeTransform {

  public constructor(
    private chefService: ChefService,
    private notificationService: MuiNotificationService
  ) {}

  public transform(content: string): Observable<string> {
    if (!content) {
      return EMPTY;
    }

    return this.chefService.fshToFhir({fsh: content}).pipe(map(resp => {
      resp.warnings?.forEach(w => this.notificationService.warning('FSH to FHIR conversion warning', w.message!, {duration: 0, closable: true}));
      resp.errors?.forEach(e => this.notificationService.error('FSH to FHIR conversion failed!', e.message!, {duration: 0, closable: true}));
      return resp.fhir ? JSON.stringify(resp.fhir[0], null, 2) : '';
    }));
  }
}
