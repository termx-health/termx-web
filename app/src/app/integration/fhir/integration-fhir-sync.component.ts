import {Component, OnInit} from '@angular/core';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirParameters, FhirValueSetLibService, JobLibService, JobLog} from '@terminology/core';
import {ActivatedRoute} from '@angular/router';
import {filter, merge, Observable, Subject, switchMap, takeUntil, timer} from 'rxjs';
import {DestroyService} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';


@Component({
  templateUrl: './integration-fhir-sync.component.html',
  providers: [DestroyService]
})
export class IntegrationFhirSyncComponent implements OnInit {
  public source?: string | null;

  public input: string = "";
  public jobResponse?: JobLog;
  public urls: string[] = [];
  public loading: {[k: string]: boolean} = {};

  public constructor(
    private fhirCodeSystemService: FhirCodeSystemLibService,
    private fhirValueSetLibService: FhirValueSetLibService,
    private fhirConceptMapLibService: FhirConceptMapLibService,
    private notificationService: MuiNotificationService,
    private jobService: JobLibService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.source = queryParamMap.get('source');
      this.jobResponse = undefined;
      this.loading['import'] = false;
      this.loading['polling'] = false;
      this.input = '';
      this.urls = [];
    });
  }

  public importUrls(): void {
    if (this.urls.length === 0) {
      return;
    }

    const fhirSyncParameters = {parameter: this.urls.map(url => ({"name": "url", "valueString": url}))};
    const importRequestMap: {[k: string]: Observable<FhirParameters>} = {
      'CodeSystem': this.fhirCodeSystemService.import(fhirSyncParameters),
      'ValueSet': this.fhirValueSetLibService.import(fhirSyncParameters),
      'ConceptMap': this.fhirConceptMapLibService.import(fhirSyncParameters),
    };

    this.notificationService.info('Sync started!');
    this.jobResponse = undefined;
    this.loading['import'] = true;
    importRequestMap[this.source!].subscribe(resp => {
        const jobIdParameter = resp.parameter?.find(p => p.name === 'jobId');
        if (jobIdParameter?.valueDecimal) {
          this.pollJobStatus(jobIdParameter.valueDecimal);
        }
      }
    ).add(() => this.loading['import'] = false);
  }

  private pollJobStatus(jobId: number): void {
    const stopPolling$ = new Subject<void>();

    this.loading['polling'] = true;
    timer(0, 3000).pipe(
      takeUntil(merge(this.destroy$, stopPolling$)),
      switchMap(() => this.jobService.getLog(jobId)),
      filter(resp => resp.execution?.status !== 'running')
    ).subscribe(jobResp => {
      stopPolling$.next();
      if (!jobResp.errors && !jobResp.warnings) {
        this.urls = [];
        jobResp.successes?.forEach(success => this.notificationService.success('Sync successful!', success, {duration: 0, closable: true}));
        return;
      }
      jobResp.errors?.forEach(error => this.notificationService.error('Sync failed!', error, {duration: 0, closable: true}));
      jobResp.warnings?.forEach(warning => this.notificationService.warning('Sync failed!', warning, {duration: 0, closable: true}));
    }).add(() => this.loading['polling'] = false);
  }

  public removeUrl(index: number): void {
    this.urls.splice(index, 1);
    this.urls = [...this.urls];
  }

  public addUrl(): void {
    if (this.input.trim().length === 0) {
      return;
    }
    this.urls.push(this.input);
    this.input = '';
  }
}
