import {Component} from '@angular/core';
import {IntegrationIcdLibService, IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
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