import {Component} from '@angular/core';
import {FhirValueSetExpandParams, FhirValueSetLibService} from '../../../fhir/_lib';
import {Clipboard} from '@angular/cdk/clipboard';


@Component({
  templateUrl: './fhir-value-set-expand.component.html',
})
export class FhirValueSetExpandComponent {
  public response?: any;
  public error?: any;

  public data = new FhirValueSetExpandParams();

  public loading: boolean = false;

  public constructor(
    private fhirValueSetService: FhirValueSetLibService,
    private clipboardService: Clipboard,
  ) {}

  public expand(): void {
    this.data.url = this.data.url || undefined;
    this.data.valueSetVersion = this.data.valueSetVersion || undefined;

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirValueSetService.expand(this.data).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
