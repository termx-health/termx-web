import {Component} from '@angular/core';
import {FhirCodeSystemLibService, FhirCodeSystemValidateCodeParams} from '@terminology/core';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  templateUrl: './fhir-code-system-validate-code.component.html',
})
export class FhirCodeSystemValidateCodeComponent {
  public response?: any;
  public error?: any;

  public data = new FhirCodeSystemValidateCodeParams();

  public loading: boolean = false;

  public constructor(
    private fhirCodeSystemLibService: FhirCodeSystemLibService,
    private clipboardService: Clipboard,
  ) {}

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
