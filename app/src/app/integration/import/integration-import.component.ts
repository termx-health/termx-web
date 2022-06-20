import {Directive, OnInit} from '@angular/core';
import {IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLog} from 'terminology-lib/job';
import {ActivatedRoute} from '@angular/router';
import {filter} from 'rxjs';
import {IntegrationAtcLibService} from 'terminology-lib/integration/atc/service/integration-atc-lib.service';
import {IntegrationIcdLibService} from 'terminology-lib/integration/icd-10/service/integration-icd-lib.service';

@Directive()
export abstract class IntegrationImportComponent implements OnInit {
  public edition?: string;
  public zipSourceUrl?: string;

  public data = new IntegrationImportConfiguration();
  public jobResponse?: JobLog;

  public loading = false;

  public constructor(
    private route: ActivatedRoute,
    public integrationAtcLibService: IntegrationAtcLibService,
    public integrationIcdLibService: IntegrationIcdLibService,
    private jobService: JobLibService,
  ) { }

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.data = new IntegrationImportConfiguration();
      this.edition = queryParamMap.get('edition') || undefined;
    });
  }

  public cleanData(): void {
    this.data.uri = this.data.uri || undefined;
    this.zipSourceUrl = this.zipSourceUrl || undefined;
    this.data.version = this.data.version || undefined;
    this.data.validFrom = this.data.validFrom || undefined;
    this.data.validFrom = this.data.validTo || undefined;
    this.data.codeSystem = this.data.codeSystem || undefined;
    this.data.codeSystemName = this.data.codeSystemName || undefined;
    this.data.codeSystemDescription = this.data.codeSystemDescription || undefined;
    this.data.codeSystemVersionDescription = this.data.codeSystemVersionDescription || undefined;
  }

  public pollJobStatus(jobId: number): void {
    const i = setInterval(() => {
      this.jobService.getLog(jobId).pipe(filter(resp => resp.execution?.status !== 'running')).subscribe(jobResp => {
          clearInterval(i);
          this.loading = false;
          this.jobResponse = jobResp;
        }
      );
    }, 5000);
  }
}
