import {Clipboard} from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import {FhirCodeSystemLibService, FhirCodeSystemSubsumesParams} from 'term-web/fhir/_lib';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiAlertModule } from '@kodality-web/marina-ui';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './fhir-code-system-subsumes.component.html',
    imports: [
    MuiCardModule,
    MuiSpinnerModule,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    MuiButtonModule,
    MuiFormModule,
    MuiIconModule,
    MuiPopoverModule,
    MuiTextareaModule,
    FormsModule,
    MuiAlertModule,
    JsonPipe,
    TranslatePipe
],
})
export class FhirCodeSystemSubsumesComponent {
  private fhirCodeSystemLibService = inject(FhirCodeSystemLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;

  public data: {
    codeA?: string,
    codeB?: string,
    system?: string,
    version?: string
  } = {};

  public loading: boolean = false;

  public subsumes(): void {
    const sp = new FhirCodeSystemSubsumesParams();
    sp.codeA = this.data.codeA || undefined;
    sp.codeB = this.data.codeB || undefined;
    sp.system = this.data.system || undefined;
    sp.version = this.data.version || undefined;

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirCodeSystemLibService.subsumes(sp).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
