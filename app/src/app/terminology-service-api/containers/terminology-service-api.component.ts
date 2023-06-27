import {Component} from '@angular/core';
import {environment} from 'app/src/environments/environment';

@Component({
  templateUrl: 'terminology-service-api.component.html',
})
export class TerminologyServiceApiComponent {

  public openTerminologyApi(): void {
    window.open(environment.swaggerUrl, '_blank');
  }
}
