import {Directive, OnInit} from '@angular/core';
import {IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLog, JobLogResponse} from 'terminology-lib/job';
import {ActivatedRoute} from '@angular/router';
import {filter, Observable} from 'rxjs';

@Directive()
export abstract class IntegrationImportComponent implements OnInit {
  public edition?: string;
  public abstract system: string;

  public data = new IntegrationImportConfiguration();
  public jobResponse?: JobLog;

  public loading = false;

  protected constructor(
    private route: ActivatedRoute,
    private jobService: JobLibService,
  ) { }

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.data = new IntegrationImportConfiguration();
      this.edition = queryParamMap.get('edition') || undefined;
    });
  }

  public abstract composeImportRequest(): Observable<JobLogResponse>

  public abstract setDefaultData(): void;

  public import(): void {
    this.data.zipSourceUrl = this.data.zipSourceUrl || undefined;
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
    this.composeImportRequest().subscribe({
        next: resp => this.pollJobStatus(resp.jobId!),
        error: err => {
          this.jobResponse = new JobLog();
          this.jobResponse.errors = [err.message];
          this.loading = false;
        }
      }
    );
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
