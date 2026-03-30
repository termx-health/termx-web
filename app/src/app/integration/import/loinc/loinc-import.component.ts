import {HttpClient} from '@angular/common/http';
import { Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {DestroyService} from '@termx-health/core-util';
import { MuiNotificationService, MuiCardModule, MuiFormModule, MuiInputModule, MuiButtonModule, MuiAlertModule, MuiCoreModule, MuiModalModule, MarinPageLayoutModule } from '@termx-health/ui';
import {environment} from 'environments/environment';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';

import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';


@Component({
    templateUrl: 'loinc-import.component.html',
    providers: [DestroyService],
    imports: [MuiCardModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, FormsModule, MuiFormModule, MuiInputModule, ValueSetConceptSelectComponent, MuiButtonModule, MuiAlertModule, MuiCoreModule, MuiModalModule, MarinPageLayoutModule, TranslatePipe, HasAnyPrivilegePipe]
})
export class LoincImportComponent {
  private http = inject(HttpClient);
  private notificationService = inject(MuiNotificationService);
  private jobService = inject(JobLibService);
  private destroy$ = inject(DestroyService);
  private router = inject(Router);


  public data: {
    version?: string,
    language?: string
  } = {};

  public loading: {[k: string]: boolean} = {};

  @ViewChild('form') public form?: NgForm;
  @ViewChild('partsFileInput') public partsFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('loincTerminologyFileInput') public loincTerminologyFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('supplementaryPropertiesFileInput') public supplementaryPropertiesFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('panelsFileInput') public panelsFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('answerListFileInput') public answerListFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('answerListLinkFileInput') public answerListLinkFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('translationsFileInput') public translationsFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('orderObservationFileInput') public orderObservationFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  public jobResponse: JobLog | null = null;
  protected modalData: {visible?: boolean} = {};

  protected importLoinc(): void {
    const formData = new FormData();
    formData.append('request', JSON.stringify(this.data));
    formData.append('partsFile', this.partsFileInput.nativeElement.files[0] as Blob, 'partsFile');
    formData.append('terminologyFile', this.loincTerminologyFileInput.nativeElement.files[0] as Blob, 'loincTerminologyFile');
    if (this.supplementaryPropertiesFileInput?.nativeElement?.files?.[0]) {
      formData.append('supplementaryPropertiesFile', this.supplementaryPropertiesFileInput.nativeElement.files[0] as Blob, 'supplementaryPropertiesFile');
    }
    if (this.panelsFileInput?.nativeElement?.files?.[0]) {
      formData.append('panelsFile', this.panelsFileInput.nativeElement.files[0] as Blob, 'panelsFile');
    }
    if (this.answerListFileInput?.nativeElement?.files?.[0]) {
      formData.append('answerListFile', this.answerListFileInput.nativeElement.files[0] as Blob, 'answerListFile');
    }
    if (this.answerListLinkFileInput?.nativeElement?.files?.[0]) {
      formData.append('answerListLinkFile', this.answerListLinkFileInput.nativeElement.files[0] as Blob, 'answerListLinkFile');
    }
    if (this.translationsFileInput?.nativeElement?.files?.[0]) {
      formData.append('translationsFile', this.translationsFileInput.nativeElement.files[0] as Blob, 'translationsFile');
    }
    if (this.orderObservationFileInput?.nativeElement?.files?.[0]) {
      formData.append('orderObservationFile', this.orderObservationFileInput.nativeElement.files[0] as Blob, 'orderObservationFile');
    }

    this.jobResponse = null;
    this.loading['process'] = true;
    this.modalData = {};
    this.http.post<JobLogResponse>(`${environment.termxApi}/loinc/import`, formData)
      .subscribe({
        next: (resp) => {
          this.pollJobStatus(resp.jobId as number);
        }, error: () => this.loading['process'] = false
      });
  }

  private pollJobStatus(jobId: number): void {
    this.jobService.pollFinishedJobLog(jobId, this.destroy$).subscribe(jobResp => {
      if (!jobResp.errors && !jobResp.warnings) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent!, {duration: 0, closable: true});
      }
      this.jobResponse = jobResp;
    }).add(() => this.loading['process'] = false);
  }

  protected openCodeSystem(mode: 'edit' | 'view'): void {
    this.router.navigate(['/resources/code-systems/', 'loinc', mode]);
  }
}
