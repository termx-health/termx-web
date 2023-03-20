import {Component} from '@angular/core';
import {FhirCodeSystemLibService, FhirCodeSystemSubsumesParams} from '@terminology/core';
import {Clipboard} from '@angular/cdk/clipboard';


@Component({
  templateUrl: './fhir-code-system-subsumes.component.html',
})
export class FhirCodeSystemSubsumesComponent {
  public response?: any;
  public error?: any;

  public data: {
    codeA?: string,
    codeB?: string,
    system?: string,
    version?: string
  } = {};

  public loading: boolean = false;

  public constructor(
    private fhirCodeSystemLibService: FhirCodeSystemLibService,
    private clipboardService: Clipboard,
  ) {}

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
