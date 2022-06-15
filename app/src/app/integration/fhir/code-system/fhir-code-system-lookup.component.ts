import {Component, ViewChild} from '@angular/core';
import {FhirCodeSystemLibService, FhirCodeSystemLookupParams} from 'lib/src/fhir';
import {ClipboardService, serializeDate} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';


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

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private integrationFhirService: FhirCodeSystemLibService,
    private clipboardService: ClipboardService,
  ) {}

  public lookUp(): void {
    const sp = new FhirCodeSystemLookupParams();
    sp.code = this.data.code || null;
    sp.system = this.data.system || null;
    sp.version = this.data.version || null;
    sp.date = serializeDate(this.data.date);
    sp.properties = this.data.properties?.join(',');

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.integrationFhirService.lookup(sp).subscribe({
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

  public copyResult(): void { /*TODO add ngx-clipboard to utils*/
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
