import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {IntegrationFhirService} from '../services/integration-fhir-service';
import {JobLibService} from 'terminology-lib/job/services/job-lib-service';


@Component({
  selector: 'twa-integration-sync',
  templateUrl: './integration-sync.component.html',
})
export class IntegrationSyncComponent implements OnChanges{
  @Input() public source?: 'CodeSystem' | 'ValueSet' | 'ConceptMap';

  public input: string = "";
  public loading: boolean = false;
  public message?: string;
  public success?: boolean = false;
  public data: string[] = [];

  public constructor(
    private integrationFhirService: IntegrationFhirService,
    private jobService: JobLibService,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["source"]){
      this.data = [];
      this.input = "";
      this.success = false;
      this.message = "";
    }
  }

  public sendRequests(): void {
    this.success = false;
    this.message = "";
    this.loading = true;
    this.integrationFhirService.import(this.source!, {
      parameter: this.data.map(url => ({"name": "url", "valueString": url}))
    }).subscribe(resp => {
        const i = setInterval(() => {
          this.jobService.getJobStatus(resp.parameter[0].valueDecimal).subscribe(jobResp => {
            if ((jobResp.execution.status !== 'running')) {
              clearInterval(i);
              this.loading = false;
              if (jobResp.warnings) {
                this.message = jobResp.warnings.warnings;
              } else if (jobResp.errors) {
                this.message = jobResp.errors.errors;
              } else {
                this.success = true;
              }
            }
          });
        }, 5000);
      }
    );
  }

  public removeRow(index: number): void {
    this.data.splice(index, 1);
    this.data = [...this.data];
  }

  public addRow(): void {
    this.data.push(this.input);
    this.input = '';
  }
}
