import {Component} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {FhirCodeSystemLibService, FhirParameters} from '../../../fhir/_lib';


@Component({
  templateUrl: './fhir-code-system-find-matches.component.html',
})
export class FhirCodeSystemFindMatchesComponent {
  public response?: any;
  public error?: any;

  public data: {
    system?: string,
    version?: string,
    exact?: boolean,
    properties?: {propertyName?: string, propertyValue?: string}[]
  } = {};

  public propertyInput: {propertyName?: string, propertyValue?: string} = {};

  public loading: boolean = false;

  public constructor(
    private fhirCodeSystemLibService: FhirCodeSystemLibService,
    private clipboardService: Clipboard,
  ) {}

  public findMatches(): void {
    const sp = new FhirParameters();
    sp.parameter = [];
    if (this.data.system) {
      sp.parameter.push({name: 'system', valueString: this.data.system});
    }
    if (this.data.version) {
      sp.parameter.push({name: 'version', valueString: this.data.version});
    }
    if (this.data.exact) {
      sp.parameter.push({name: 'exact', valueBoolean: this.data.exact});
    }
    if (this.data.properties) {
      this.data.properties.forEach(p => {
        let parts = [];
        if (p.propertyName) {
          parts.push({name: 'code', valueCode: p.propertyName});
        }
        if (p.propertyValue) {
          parts.push({name: 'value', valueString: p.propertyValue});
        }
        sp.parameter!.push({name: 'property', part: parts});
      });
    }


    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirCodeSystemLibService.findMatches(sp).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public addProperty(): void {
    if (this.propertyInput) {
      this.data.properties = [...(this.data.properties || []), this.propertyInput];
      this.propertyInput = {};
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
