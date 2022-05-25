import {Component, OnInit} from '@angular/core';
import {IntegrationFhirService} from '../services/integration-fhir-service';
import {JobLibService} from 'terminology-lib/job/services/job-lib-service';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'twa-integration-fhir-sync',
  templateUrl: './integration-fhir-sync.component.html',
})
export class IntegrationFhirSyncComponent implements OnInit {
  public source?: string | null;

  public input: string = "";
  public loading: boolean = false;
  public message?: {[type:string]: string};
  public data: string[] = [];

  public constructor(
    private integrationFhirService: IntegrationFhirService,
    private jobService: JobLibService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.source = queryParamMap.get('source');
    });
  }

  public sendRequests(): void {
    if (this.data.length === 0){
      return;
    }
    this.message = undefined;
    this.loading = true;
    this.integrationFhirService.import(this.source!, {
      parameter: this.data.map(url => ({"name": "url", "valueString": url}))
    }).subscribe(resp => {
      const jobIdParameter = resp.parameter?.find(p => p.name === 'jobId');
        if (jobIdParameter?.valueDecimal) {
          this.pollJobStatus(jobIdParameter.valueDecimal);
        }
      }
    );
  }

  private pollJobStatus(jobId: number): void {
    const i = setInterval(() => {
      this.jobService.getJobStatus(jobId).subscribe(jobResp => {
        if (jobResp.execution?.status !== 'running') {
          clearInterval(i);
          this.loading = false;
          const type = (jobResp.errors? 'danger' : '') || (jobResp.warnings? 'warning' : '') || 'success';
          const message = (jobResp.errors? jobResp.errors.errors : '') || (jobResp.warnings? jobResp.warnings.warnings : '') || 'completed';
          this.message = {[type!]: message} ;
          if (type === 'success'){
            this.data = [];
          }
        }
      });
    }, 5000);
  }


  public removeRow(index: number): void {
    this.data.splice(index, 1);
    this.data = [...this.data];
  }

  public addRow(): void {
    if (this.input.trim().length === 0) {
      return;
    }
    this.data.push(this.input);
    this.input = '';
  }
}
