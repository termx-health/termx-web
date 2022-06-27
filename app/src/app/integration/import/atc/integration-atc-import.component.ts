import {Component} from '@angular/core';
import {IntegrationAtcLibService, IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';


@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationAtcImportComponent extends IntegrationImportComponent {
  public system = 'atc';

  public constructor(
    private integrationAtcLibService: IntegrationAtcLibService,
    route: ActivatedRoute,
    jobService: JobLibService,
  ) {
    super(route, jobService);
  };

  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationAtcLibService.import(this.data, this.edition!, this.zipSourceUrl);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultAtcConfigurations(this.edition!);
  }
}
