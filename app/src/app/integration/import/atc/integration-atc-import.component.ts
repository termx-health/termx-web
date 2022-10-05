import {Component} from '@angular/core';
import {IntegrationAtcLibService, IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MuiNotificationService} from '@kodality-web/marina-ui';


@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationAtcImportComponent extends IntegrationImportComponent {
  public breadcrumbs = ['web.integration.systems.atc', 'web.integration.import.atc'];

  public constructor(
    private integrationAtcLibService: IntegrationAtcLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
    notificationService: MuiNotificationService
  ) {
    super(route, jobService, notificationService);
  };

  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationAtcLibService.import(this.data, this.edition!, this.data.sourceUrl);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultAtcConfigurations(this.edition!);
  }
}
