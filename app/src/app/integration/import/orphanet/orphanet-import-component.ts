import {Component} from '@angular/core';
import {IntegrationImportComponent} from '../integration-import.component';
import {ActivatedRoute} from '@angular/router';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {IntegrationImportConfiguration} from 'terminology-lib/integration';
import {Observable} from 'rxjs';
import {IntegrationOrphanetLibService} from 'terminology-lib/integration/orphanet/service/integration-orphanet-lib.service';
import {MuiNotificationService} from '@kodality-health/marina-ui';

@Component({
  templateUrl: '../integration-import.component.html',
})
export class OrphanetImportComponent extends IntegrationImportComponent {
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
