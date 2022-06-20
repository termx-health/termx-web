import {Component} from '@angular/core';
import {IntegrationImportConfiguration} from 'lib/src/integration';
import {JobLibService, JobLogResponse} from 'lib/src/job';
import {IntegrationImportComponent} from '../integration-import.component';
import {Observable} from 'rxjs';
import {IntegrationAtcLibService} from 'terminology-lib/integration/atc/service/integration-atc-lib.service';
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
