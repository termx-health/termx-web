import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {FhirCodeSystemLibService, FhirCodeSystemValidateCodeParams} from 'terminology-lib/fhir';
import {ClipboardService} from '@kodality-web/core-util';

@Component({
  templateUrl: './fhir-code-system-validate-code.component.html',
})
export class FhirCodeSystemValidateCodeComponent {
  public response?: any;
  public error?: any;

  public data = new FhirCodeSystemValidateCodeParams();

  public loading: boolean = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private integrationFhirService: FhirCodeSystemLibService,
    private clipboardService: ClipboardService,
  ) {}

  public validateCode(): void {
    this.data.code = this.data.code || null;
    this.data.system = this.data.system || null;
    this.data.display = this.data.display || null;
    this.data.version = this.data.version || null;
    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.integrationFhirService.validateCode(this.data).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
