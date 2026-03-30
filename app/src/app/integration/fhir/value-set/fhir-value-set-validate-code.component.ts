import {Clipboard} from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import {FhirValueSetLibService, FhirValueSetValidateCodeParams} from 'term-web/fhir/_lib';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiAlertModule } from '@termx-health/ui';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './fhir-value-set-validate-code.component.html',
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
        TranslatePipe,
    ],
})
export class FhirValueSetValidateCodeComponent {
  private fhirValueSetService = inject(FhirValueSetLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;

  public data = new FhirValueSetValidateCodeParams();

  public loading: boolean = false;

  public validateCode(): void {
    this.data.code = this.data.code || undefined;
    this.data.url = this.data.url || undefined;
    this.data.valueSetVersion = this.data.valueSetVersion || undefined;
    this.data.display = this.data.display || undefined;
    this.data.system = this.data.system || undefined;
    this.data.systemVersion = this.data.systemVersion || undefined;

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirValueSetService.validateCode(this.data).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
