import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService} from '@termx-health/core-util';
import { MuiNotificationService, MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiCoreModule, MuiTextareaModule, MuiAlertModule } from '@termx-health/ui';
import {Observable} from 'rxjs';
import {JobLibService, JobLog} from 'term-web/sys/_lib';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirParameters, FhirValueSetLibService} from 'term-web/fhir/_lib';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';

import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './integration-fhir-sync.component.html',
    providers: [DestroyService],
    imports: [MuiCardModule, MuiSpinnerModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiCoreModule, MuiTextareaModule, FormsModule, MuiAlertModule, TranslatePipe]
})
export class IntegrationFhirSyncComponent implements OnInit {
  private fhirCodeSystemService = inject(FhirCodeSystemLibService);
  private fhirValueSetLibService = inject(FhirValueSetLibService);
  private fhirConceptMapLibService = inject(FhirConceptMapLibService);
  private notificationService = inject(MuiNotificationService);
  private jobService = inject(JobLibService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public source?: string | null;

  public input: string = "";
  public id: string = "";
  public jobResponse?: JobLog;
  public resources: {url?: string, id?: string}[] = [];
  public loading: {[k: string]: boolean} = {};

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.source = queryParamMap.get('source');
      this.jobResponse = undefined;
      this.loading['import'] = false;
      this.loading['polling'] = false;
      this.input = '';
      this.resources = [];
    });
  }

  public importUrls(): void {
    if (this.resources.length === 0) {
      return;
    }

    const fhirSyncParameters: FhirParameters = {
      resourceType: "Parameters",
      parameter: this.resources.map(r => ({name: "resources", part: [{name: "url", valueString: r.url}, {name: "id", valueString: r.id}]}))
    };
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
        if (jobIdParameter?.valueString) {
          this.pollJobStatus(Number(jobIdParameter.valueString));
        }
      }
    ).add(() => this.loading['import'] = false);
  }

  private pollJobStatus(jobId: number): void {
    this.loading['polling'] = true;
    this.jobService.pollFinishedJobLog(jobId, this.destroy$).subscribe(jobResp => {
      if (!jobResp.errors && !jobResp.warnings) {
        this.resources = [];
        jobResp.successes?.forEach(success => this.notificationService.success('Sync successful!', success, {duration: 0, closable: true}));
        return;
      }
      jobResp.errors?.forEach(error => this.notificationService.error('Sync failed!', error, {duration: 0, closable: true}));
      jobResp.warnings?.forEach(warning => this.notificationService.warning('Sync failed!', warning, {duration: 0, closable: true}));
    }).add(() => this.loading['polling'] = false);
  }

  public removeUrl(index: number): void {
    this.resources.splice(index, 1);
    this.resources = [...this.resources];
  }

  public addUrl(): void {
    if (this.input.trim().length === 0 || this.id.trim().length === 0) {
      return;
    }
    this.resources.push({url: this.input, id: this.id});
    this.input = '';
  }
}
