import {Clipboard} from '@angular/cdk/clipboard';
import {Component, inject} from '@angular/core';
import {environment} from 'environments/environment';
import {FhirValueSetLibService, FhirValueSetValidateCodeParams} from 'term-web/fhir/_lib';
import {CodeSystem} from 'term-web/resources/_lib/code-system/model/code-system';
import {CodeSystemVersion} from 'term-web/resources/_lib/code-system/model/code-system-version';
import {CodeSystemLibModule} from 'term-web/resources/_lib/code-system/code-system-lib.module';
import {ValueSet} from 'term-web/resources/_lib/value-set/model/value-set';
import {ValueSetLibModule} from 'term-web/resources/_lib/value-set/value-set-lib.module';
import {
  MuiAlertModule, MuiButtonModule, MuiCardModule, MuiFormModule, MuiIconModule, MuiInputModule,
  MuiPopoverModule, MuiSpinnerModule, MuiTextareaModule
} from '@termx-health/ui';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  templateUrl: './fhir-value-set-validate-code.component.html',
  imports: [
    MuiCardModule, MuiSpinnerModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiButtonModule,
    MuiFormModule, MuiIconModule, MuiPopoverModule, MuiInputModule, MuiTextareaModule, MuiAlertModule,
    FormsModule, JsonPipe, TranslatePipe, CodeSystemLibModule, ValueSetLibModule
  ],
})
export class FhirValueSetValidateCodeComponent {
  private fhirValueSetService = inject(FhirValueSetLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;
  public loading = false;

  public valueSet?: ValueSet;
  public codeSystem?: CodeSystem;
  public systemVersionObj?: CodeSystemVersion;
  public data = new FhirValueSetValidateCodeParams();

  protected get baseUrl(): string {
    return `${environment.termxApi}/fhir/ValueSet`;
  }

  public onValueSetSelect(vs: ValueSet): void {
    this.valueSet = vs;
    this.data.url = vs?.uri;
    this.data.valueSetVersion = undefined;
  }

  public onSystemSelect(cs: CodeSystem): void {
    this.codeSystem = cs;
    this.data.system = cs?.uri;
    this.data.systemVersion = undefined;
    this.systemVersionObj = undefined;
    this.data.code = undefined;
  }

  public onSystemVersionSelect(v: CodeSystemVersion): void {
    this.systemVersionObj = v;
    // SNOMED needs the edition URI as the version (see $lookup); other code systems use the version string.
    const isSnomed = this.data.system?.startsWith('http://snomed.info/sct');
    this.data.systemVersion = (isSnomed && v?.uri) ? v.uri : v?.version;
  }

  public get command(): string {
    const q = this.buildQuery();
    return `GET ${this.baseUrl}/$validate-code${q ? '?' + q : ''}`;
  }

  public validateCode(): void {
    this.loading = true;
    this.error = undefined;
    this.response = undefined;
    this.fhirValueSetService.validateCode(this.buildParams()).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }

  public copyCommand(): void {
    this.clipboardService.copy(this.command);
  }

  private buildParams(): FhirValueSetValidateCodeParams {
    const p = new FhirValueSetValidateCodeParams();
    p.url = this.data.url || undefined;
    p.valueSetVersion = this.data.valueSetVersion || undefined;
    p.code = this.data.code || undefined;
    p.system = this.data.system || undefined;
    p.systemVersion = this.data.systemVersion || undefined;
    p.display = this.data.display || undefined;
    return p;
  }

  private buildQuery(): string {
    const p = this.buildParams() as Record<string, string | undefined>;
    return Object.keys(p)
      .filter(k => p[k] !== undefined && p[k] !== null && p[k] !== '')
      .map(k => `${k}=${encodeURIComponent(p[k]!)}`)
      .join('&');
  }
}
