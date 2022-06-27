import {Component, OnInit} from '@angular/core';
import {JobLibService, JobLog} from 'terminology-lib/job';
import {ActivatedRoute} from '@angular/router';
import {filter, Observable} from 'rxjs';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirParameters, FhirValueSetLibService} from 'terminology-lib/fhir';


@Component({
  templateUrl: './integration-fhir-sync.component.html',
})
export class IntegrationFhirSyncComponent implements OnInit {
  public source?: string | null;

  public input: string = "";
  public loading: boolean = false;
  public jobResponse?: JobLog;
  public urls: string[] = [];

  public constructor(
    private fhirCodeSystemService: FhirCodeSystemLibService,
    private fhirValueSetLibService: FhirValueSetLibService,
    private fhirConceptMapLibService: FhirConceptMapLibService,
    private jobService: JobLibService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.source = queryParamMap.get('source');
      this.jobResponse = undefined;
      this.input = '';
      this.urls = [];
    });
  }

  public importUrls(): void {
    if (this.urls.length === 0) {
      return;
    }
    this.jobResponse = undefined;
    this.loading = true;
    const fhirSyncParameters = {parameter: this.urls.map(url => ({"name": "url", "valueString": url}))};
    const importRequestMap: {[k: string]: Observable<FhirParameters>} = {
      'CodeSystem': this.fhirCodeSystemService.import(fhirSyncParameters),
      'ValueSet': this.fhirValueSetLibService.import(fhirSyncParameters),
      'ConceptMap': this.fhirConceptMapLibService.import(fhirSyncParameters),
    };
    importRequestMap[this.source!].subscribe(resp => {
        const jobIdParameter = resp.parameter?.find(p => p.name === 'jobId');
        if (jobIdParameter?.valueDecimal) {
          this.pollJobStatus(jobIdParameter.valueDecimal);
        }
      }
    );
  }

  private pollJobStatus(jobId: number): void {
    const i = setInterval(() => {
      this.jobService.getLog(jobId).pipe(filter(resp => resp.execution?.status !== 'running')).subscribe(jobResp => {
          clearInterval(i);
          this.loading = false;
          if (!jobResp.errors && !jobResp.warnings) {
            this.urls = [];
          }
          this.jobResponse = jobResp;
        }
      );
    }, 5000);
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
