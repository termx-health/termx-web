import {Component} from '@angular/core';
import {environment} from 'environments/environment';
import { MuiFormModule, MuiCardModule, MuiButtonModule, MuiAlertModule } from '@kodality-web/marina-ui';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'terminology-service-api.component.html',
    imports: [
    MuiFormModule,
    MuiCardModule,
    MuiButtonModule,
    MuiAlertModule,
    TranslatePipe
],
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
    window.open(this.env.snowstormUrl + '/swagger-ui/index.html', '_blank');
  }

  protected openSnomedBrowser(): void {
    window.open(this.env.snomedBrowserUrl, '_blank');
  }

  protected openSnomedBrowserDailyBuild(): void {
    window.open(this.env.snomedBrowserDailyBuildUrl, '_blank');
  }

}
