import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  templateUrl: 'terminology-service-api.component.html',
})
export class TerminologyServiceApiComponent {

  public openTerminologyApi(): void {
    window.open(environment.swaggerUrl, '_blank');
  }
}
