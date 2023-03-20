import {Component} from '@angular/core';
import {FhirConceptMapLibService, FhirConceptMapTranslateParams} from '@terminology/core';
import {Clipboard} from '@angular/cdk/clipboard';


@Component({
  templateUrl: './fhir-concept-map-translate.component.html',
})
export class FhirConceptMapTranslateComponent {
  public response?: any;
  public error?: any;

  public data = new FhirConceptMapTranslateParams();

  public loading: boolean = false;

  public constructor(
    private fhirConceptMapLibService: FhirConceptMapLibService,
    private clipboardService: Clipboard,
  ) {}

  public translate(): void {
    this.data.uri = this.data.uri || undefined;
    this.data.conceptMapVersion = this.data.conceptMapVersion || undefined;
    this.data.code = this.data.code || undefined;
    this.data.system = this.data.system || undefined;
    this.data.version = this.data.version || undefined;
    this.data.targetSystem = this.data.targetSystem || undefined;

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirConceptMapLibService.translate(this.data).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
