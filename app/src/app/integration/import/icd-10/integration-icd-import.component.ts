import {Component} from '@angular/core';
import {IntegrationIcdLibService, IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MuiNotificationService} from '@kodality-health/marina-ui';


@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationIcdImportComponent extends IntegrationImportComponent {
  public breadcrumbs = ['web.integration.systems.icd-10', 'web.integration.import.icd-10'];

  public constructor(
    private integrationIcdLibService: IntegrationIcdLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
    notificationService: MuiNotificationService
  ) {
    super(route, jobService, notificationService);
  }


  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationIcdLibService.import(this.data, this.edition!, this.data.sourceUrl!);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultIcdConfigurations(this.edition!);
  }
}
