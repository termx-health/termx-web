import {Clipboard} from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import {FhirCodeSystemLibService, FhirCodeSystemValidateCodeParams} from 'term-web/fhir/_lib';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiAlertModule } from '@kodality-web/marina-ui';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './fhir-code-system-validate-code.component.html',
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
export class FhirCodeSystemValidateCodeComponent {
  private fhirCodeSystemLibService = inject(FhirCodeSystemLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;

  public data = new FhirCodeSystemValidateCodeParams();

  public loading: boolean = false;

  public validateCode(): void {
    this.data.code = this.data.code || undefined;
    this.data.url = this.data.url || undefined;
    this.data.display = this.data.display || undefined;
    this.data.version = this.data.version || undefined;
    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirCodeSystemLibService.validateCode(this.data).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
