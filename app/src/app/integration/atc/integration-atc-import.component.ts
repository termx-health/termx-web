import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLog} from 'terminology-lib/job';
import {IntegrationAtcLibService} from 'terminology-lib/integration/atc/service/integration-atc-lib.service';
import {filter} from 'rxjs';

@Component({
  templateUrl: './integration-atc-import.component.html',
})
export class IntegrationAtcImportComponent implements OnInit {
  public edition?: string;

  public data = new IntegrationImportConfiguration();
  public jobResponse?: JobLog;

  public loading = false;

  public constructor(
    private route: ActivatedRoute,
    private integrationAtcLibService: IntegrationAtcLibService,
    private jobService: JobLibService,
  ) { }

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.data = new IntegrationImportConfiguration();
      this.edition = queryParamMap.get('edition') || undefined;
    });
  }

  public import(): void {
    this.data.uri = this.data.uri || undefined;
    this.data.version = this.data.version || undefined;
    this.data.validFrom = this.data.validFrom || undefined;
    this.data.validFrom = this.data.validTo || undefined;
    this.data.codeSystem = this.data.codeSystem || undefined;
    this.data.codeSystemName = this.data.codeSystemName || undefined;
    this.data.codeSystemDescription = this.data.codeSystemDescription || undefined;
    this.data.codeSystemVersionDescription = this.data.codeSystemVersionDescription || undefined;

    this.jobResponse = undefined;
    this.loading = true;

    this.integrationAtcLibService.import(this.data, this.edition).subscribe({
        next: resp => this.pollJobStatus(resp.jobId!),
        error: err => {
          this.jobResponse = new JobLog();
          this.jobResponse.errors = [err.message];
          this.loading = false;
        }
      }
    );
  }


  private pollJobStatus(jobId: number): void {
    const i = setInterval(() => {
      this.jobService.getLog(jobId).pipe(filter(resp => resp.execution?.status !== 'running')).subscribe(jobResp => {
          clearInterval(i);
          this.loading = false;
          this.jobResponse = jobResp;
        }
      );
    }, 5000);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultConfigurations(this.edition!);
  }
}
