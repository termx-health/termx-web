import {Clipboard} from '@angular/cdk/clipboard';
import {Component, inject} from '@angular/core';
import {environment} from 'environments/environment';
import {FhirCodeSystemLibService, FhirParameters} from 'term-web/fhir/_lib';
import {CodeSystem} from 'term-web/resources/_lib/code-system/model/code-system';
import {CodeSystemVersion} from 'term-web/resources/_lib/code-system/model/code-system-version';
import {CodeSystemLibModule} from 'term-web/resources/_lib/code-system/code-system-lib.module';
import {
  MuiAlertModule, MuiButtonModule, MuiCardModule, MuiCheckboxModule, MuiFormModule, MuiIconModule,
  MuiInputModule, MuiPopoverModule, MuiSpinnerModule, MuiTextareaModule
} from '@termx-health/ui';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  templateUrl: './fhir-code-system-find-matches.component.html',
  imports: [
    MuiCardModule, MuiSpinnerModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiButtonModule,
    MuiFormModule, MuiIconModule, MuiPopoverModule, MuiInputModule, MuiCheckboxModule, MuiTextareaModule,
    MuiAlertModule, FormsModule, JsonPipe, TranslatePipe, CodeSystemLibModule
  ],
})
export class FhirCodeSystemFindMatchesComponent {
  private fhirCodeSystemLibService = inject(FhirCodeSystemLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;
  public loading = false;

  public codeSystem?: CodeSystem;
  public versionObj?: CodeSystemVersion;
  public data: {
    system?: string,
    version?: string,
    exact?: boolean,
    properties?: {propertyName?: string, propertyValue?: string}[]
  } = {};
  public propertyInput: {propertyName?: string, propertyValue?: string} = {};

  protected get baseUrl(): string {
    return `${environment.termxApi}/fhir/CodeSystem`;
  }

  public onSystemSelect(cs: CodeSystem): void {
    this.codeSystem = cs;
    this.data.system = cs?.uri;
    this.data.version = undefined;
    this.versionObj = undefined;
  }

  public onVersionSelect(v: CodeSystemVersion): void {
    this.versionObj = v;
    // SNOMED needs the edition URI as the version (see $lookup); other code systems use the version string.
    const isSnomed = this.data.system?.startsWith('http://snomed.info/sct');
    this.data.version = (isSnomed && v?.uri) ? v.uri : v?.version;
  }

  public get command(): string {
    return `POST ${this.baseUrl}/$find-matches\n` + JSON.stringify(this.buildParameters(), null, 2);
  }

  public findMatches(): void {
    this.loading = true;
    this.error = undefined;
    this.response = undefined;
    this.fhirCodeSystemLibService.findMatches(this.buildParameters()).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public addProperty(): void {
    if (this.propertyInput?.propertyName || this.propertyInput?.propertyValue) {
      this.data.properties = [...(this.data.properties || []), this.propertyInput];
      this.propertyInput = {};
    }
  }

  public removeProperty(index: number): void {
    this.data.properties?.splice(index, 1);
    this.data.properties = [...this.data.properties!];
    if (this.data.properties.length === 0) { this.data.properties = undefined; }
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }

  public copyCommand(): void {
    this.clipboardService.copy(this.command);
  }

  private buildParameters(): FhirParameters {
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
    (this.data.properties || []).forEach(p => {
      const parts = [];
      if (p.propertyName) {
        parts.push({name: 'code', valueCode: p.propertyName});
      }
      if (p.propertyValue) {
        parts.push({name: 'value', valueString: p.propertyValue});
      }
      sp.parameter!.push({name: 'property', part: parts});
    });
    return sp;
  }
}
