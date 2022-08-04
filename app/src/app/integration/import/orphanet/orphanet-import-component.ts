import {Component} from '@angular/core';
import {IntegrationImportComponent} from '../integration-import.component';
import {ActivatedRoute} from '@angular/router';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {IntegrationImportConfiguration} from 'terminology-lib/integration';
import {Observable} from 'rxjs';
import {IntegrationOrphanetLibService} from 'terminology-lib/integration/orphanet/service/integration-orphanet-lib.service';

@Component({
  templateUrl: '../integration-import.component.html',
})
export class OrphanetImportComponent extends IntegrationImportComponent {
  public system = 'orphanet';

  public constructor(
    private orphanetLibService: IntegrationOrphanetLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
  ) {
    super(route, jobService);
  }


  public composeImportRequest(): Observable<JobLogResponse> {
    return this.orphanetLibService.import(this.data, this.data.zipSourceUrl!);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getOrphanetConfigurations();
  }
}
