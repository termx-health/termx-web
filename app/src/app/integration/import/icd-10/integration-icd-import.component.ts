import {Component} from '@angular/core';
import {IntegrationImportConfiguration} from 'lib/src/integration';
import {JobLog} from 'lib/src/job';
import {IntegrationImportComponent} from '../integration-import.component';

@Component({
  templateUrl: '../integration-import.component.html',
})
export class IntegrationIcdImportComponent extends IntegrationImportComponent {
  public system = 'icd-10';

  public import(): void {
    this.cleanData();

    this.jobResponse = undefined;
    this.loading = true;
    this.integrationIcdLibService.import(this.data, this.edition!, this.zipSourceUrl!).subscribe({
        next: resp => this.pollJobStatus(resp.jobId!),
        error: err => {
          this.jobResponse = new JobLog();
          this.jobResponse.errors = [err.message];
          this.loading = false;
        }
      }
    );
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultConfigurations(this.system!, this.edition!);
  }
}
