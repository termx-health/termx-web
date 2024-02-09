import {Component} from '@angular/core';
import {environment} from 'app/src/environments/environment';

@Component({
  templateUrl: 'terminology-service-api.component.html',
})
export class TerminologyServiceApiComponent {
  protected env = environment;

  protected openTermXApi(): void {
    window.open(this.env.swaggerUrl + '?urls.primaryName=termx', '_blank');
  }

  protected openTermXFhirApi(): void {
    window.open(this.env.swaggerUrl + '?urls.primaryName=termx-fhir', '_blank');
  }

  protected openSnowstormApi(): void {
    window.open(this.env.snowstormUrl, '_blank');
  }

  protected openSnowstormBrowser(): void {
    window.open(this.env.snowstormUrl + 'snomed-browser', '_blank');
  }

  protected openSnowstormDailyBuildBrowser(): void {
    window.open(this.env.snowstormDailyBuildUrl + 'snomed-browser', '_blank');
  }
}
