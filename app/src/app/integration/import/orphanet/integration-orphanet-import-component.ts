import {Component} from '@angular/core';
import {IntegrationImportComponent} from '../integration-import.component';
import {ActivatedRoute} from '@angular/router';
import {IntegrationImportConfiguration, IntegrationOrphanetLibService} from 'term-web/integration/_lib';
import {JobLibService, JobLogResponse} from 'term-web/job/_lib';
import {Observable} from 'rxjs';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationOrphanetImportComponent extends IntegrationImportComponent {
  public breadcrumbs = ['web.integration.systems.orphanet', 'web.integration.import.orphanet'];

  public constructor(
    private orphanetLibService: IntegrationOrphanetLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
    notificationService: MuiNotificationService
  ) {
    super(route, jobService, notificationService);
  }


  public composeImportRequest(): Observable<JobLogResponse> {
    return this.orphanetLibService.import(this.data, this.data.sourceUrl!);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getOrphanetConfigurations();
  }
}