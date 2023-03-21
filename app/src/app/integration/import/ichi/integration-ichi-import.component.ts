import {Component} from '@angular/core';
import {IntegrationIchiLibService, IntegrationImportConfiguration} from 'term-web/integration/_lib';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {JobLibService, JobLogResponse} from 'term-web/job/_lib';


@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationIchiImportComponent extends IntegrationImportComponent {
  public breadcrumbs = ['web.integration.systems.ichi', 'web.integration.import.ichi'];

  public constructor(
    private integrationIchiLibService: IntegrationIchiLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
    notificationService: MuiNotificationService
  ) {
    super(route, jobService, notificationService);
  }


  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationIchiLibService.import(this.data, this.data.sourceUrl!);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getIchiConfigurations();
  }
}
