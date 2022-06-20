import {Component} from '@angular/core';
import {IntegrationImportConfiguration} from 'lib/src/integration';
import {JobLibService, JobLogResponse} from 'lib/src/job';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {IntegrationIcdLibService} from 'terminology-lib/integration/icd-10/service/integration-icd-lib.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationIcdImportComponent extends IntegrationImportComponent {
  public system = 'icd-10';

  public constructor(
    private integrationIcdLibService: IntegrationIcdLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
  ) {
    super(route, jobService);
  }


  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationIcdLibService.import(this.data, this.edition!, this.zipSourceUrl!);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultIcdConfigurations(this.edition!);
  }
}
