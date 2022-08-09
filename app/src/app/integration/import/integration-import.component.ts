import {Directive, OnInit} from '@angular/core';
import {IntegrationImportConfiguration} from 'terminology-lib/integration';
import {JobLibService, JobLogResponse} from 'terminology-lib/job';
import {ActivatedRoute} from '@angular/router';
import {filter, Observable} from 'rxjs';
import {MuiNotificationService} from '@kodality-health/marina-ui';

@Directive()
export abstract class IntegrationImportComponent implements OnInit {
  public edition?: string;
  public abstract system: string;

  public data = new IntegrationImportConfiguration();

  public loading = false;

  protected constructor(
    private route: ActivatedRoute,
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
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
    this.data.sourceUrl = this.data.sourceUrl || undefined;
    this.data.uri = this.data.uri || undefined;
    this.data.version = this.data.version || undefined;
    this.data.validFrom = this.data.validFrom || undefined;
    this.data.validTo = this.data.validTo || undefined;
    this.data.codeSystem = this.data.codeSystem || undefined;
    this.data.codeSystemName = this.data.codeSystemName || undefined;
    this.data.codeSystemDescription = this.data.codeSystemDescription || undefined;
    this.data.codeSystemVersionDescription = this.data.codeSystemVersionDescription || undefined;

    this.loading = true;
    this.notificationService.info('Import started!');
    this.composeImportRequest().subscribe({
        next: resp => this.pollJobStatus(resp.jobId!),
        error: err => {
          this.notificationService.error('Composing of import request failed!', err.message, {duration: 0, closable: true});
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
          if (jobResp.errors) {
            for (let error of jobResp.errors) {
              this.notificationService.error('Import failed!', error, {duration: 0, closable: true});
            }
          }
          if (jobResp.warnings) {
            for (let warning of jobResp.warnings) {
              this.notificationService.warning('Import failed!', warning, {duration: 0, closable: true});
            }
          }
          if (jobResp.successes) {
            for (let success of jobResp.successes) {
              this.notificationService.success('Import successful!', success, {duration: 0, closable: true});
            }
          }
        }
      );
    }, 5000);
  }
}
