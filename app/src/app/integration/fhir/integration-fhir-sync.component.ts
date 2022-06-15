import {Component, OnInit} from '@angular/core';
import {JobLibService} from 'terminology-lib/job/services/job-lib-service';
import {ActivatedRoute} from '@angular/router';
import {filter, Observable} from 'rxjs';
import {JobLog} from 'terminology-lib/job';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirSyncParameters, FhirValueSetLibService} from 'terminology-lib/fhir';


@Component({
  templateUrl: './integration-fhir-sync.component.html',
})
export class IntegrationFhirSyncComponent implements OnInit {
  public source?: string | null;

  public input: string = "";
  public loading: boolean = false;
  public jobResponse?: {type: string, message: string};
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
    const importRequestMap: {[k: string]: Observable<FhirSyncParameters>} = {
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
          this.setJobResponse(jobResp);
          if (this.jobResponse?.type === 'success') {
            this.urls = [];
          }
        }
      );
    }, 5000);
  }

  private setJobResponse(jobResp: JobLog): void {
    if (jobResp.errors) {
      this.jobResponse = {type: 'danger', message: jobResp.errors.errors};
    } else if (jobResp.warnings) {
      this.jobResponse = {type: 'warning', message: jobResp.warnings.warnings};
    } else {
      this.jobResponse = {type: 'success', message: 'Completed'};
    }
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
