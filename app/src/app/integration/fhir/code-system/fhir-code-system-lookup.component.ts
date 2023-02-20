import {Component} from '@angular/core';
import {FhirCodeSystemLibService, FhirCodeSystemLookupParams} from 'terminology-lib/fhir';
import {serializeDate} from '@kodality-web/core-util';
import {Clipboard} from '@angular/cdk/clipboard';


@Component({
  templateUrl: './fhir-code-system-lookup.component.html',
})
export class FhirCodeSystemLookupComponent {
  public response?: any;
  public error?: any;

  public data: {
    code?: string,
    system?: string,
    version?: string,
    date?: Date,
    propertyInput?: string,
    properties?: string[]
  } = {};

  public loading: boolean = false;

  public constructor(
    private fhirCodeSystemLibService: FhirCodeSystemLibService,
    private clipboardService: Clipboard,
  ) {}

  public lookUp(): void {
    const sp = new FhirCodeSystemLookupParams();
    sp.code = this.data.code || undefined;
    sp.system = this.data.system || undefined;
    sp.version = this.data.version || undefined;
    sp.date = serializeDate(this.data.date);
    sp.properties = this.data.properties?.join(',');

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirCodeSystemLibService.lookup(sp).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public addProperty(): void {
    if (this.data.propertyInput) {
      this.data.properties = [...(this.data.properties || []), this.data.propertyInput];
      this.data.propertyInput = '';
    }
  }

  public removeProperty(index: number): void {
    this.data.properties?.splice(index, 1);
    this.data.properties = [...this.data.properties!];
    this.data.properties.length === 0 ? this.data.properties = undefined : '';
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
