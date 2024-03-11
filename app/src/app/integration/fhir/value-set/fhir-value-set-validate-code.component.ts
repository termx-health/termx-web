import {Clipboard} from '@angular/cdk/clipboard';
import {Component} from '@angular/core';
import {FhirValueSetLibService, FhirValueSetValidateCodeParams} from '../../../fhir/_lib';


@Component({
  templateUrl: './fhir-value-set-validate-code.component.html',
})
export class FhirValueSetValidateCodeComponent {
  public response?: any;
  public error?: any;

  public data = new FhirValueSetValidateCodeParams();

  public loading: boolean = false;

  public constructor(
    private fhirValueSetService: FhirValueSetLibService,
    private clipboardService: Clipboard,
  ) {}

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
