import {Component} from '@angular/core';
import {environment} from 'app/src/environments/environment';

@Component({
  templateUrl: 'terminology-service-api.component.html',
})
export class TerminologyServiceApiComponent {

  public openTermXApi(): void {
    window.open(environment.swaggerUrl + '?urls.primaryName=termx', '_blank');
  }

  public openTermXFhirApi(): void {
    window.open(environment.swaggerUrl + '?urls.primaryName=termx-fhir', '_blank');
  }

  public openSnowstormApi(): void {
    window.open(environment.snowstormUrl, '_blank');
  }

  public openSnowstormBrowser(): void {
    window.open(environment.snowstormUrl + 'snomed-browser', '_blank');
  }

  public openSnowstormDailyBuildBrowser(): void {
    window.open(environment.snowstormDailyBuildUrl + 'snomed-browser', '_blank');
  }
}
