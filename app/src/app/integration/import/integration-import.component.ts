import {Directive, OnInit} from '@angular/core';
import {IntegrationImportConfiguration, JobLibService, JobLogResponse} from '@terminology/core';
import {ActivatedRoute} from '@angular/router';
import {filter, Observable} from 'rxjs';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Directive()
export abstract class IntegrationImportComponent implements OnInit {
  public abstract breadcrumbs: string[];
  public edition?: string;
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
      this.loading = false;
    });
  }

  public abstract composeImportRequest(): Observable<JobLogResponse>;

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
          jobResp.errors?.forEach(error => this.notificationService.error('Import failed!', error, {duration: 0, closable: true}));
          if (!jobResp.errors) {
            this.notificationService.success(`Import from ${jobResp.definition?.type} completed!`, undefined, {duration: 0, closable: true});
          }
        }
      );
    }, 5000);
  }
}
