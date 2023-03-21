import {Component} from '@angular/core';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {IntegrationIcdLibService, IntegrationImportConfiguration} from 'term-web/integration/_lib';
import {JobLibService, JobLogResponse} from 'term-web/job/_lib';


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
