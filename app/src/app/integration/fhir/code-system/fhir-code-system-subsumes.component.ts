import {Clipboard} from '@angular/cdk/clipboard';
import {Component, inject} from '@angular/core';
import {environment} from 'environments/environment';
import {FhirCodeSystemLibService, FhirCodeSystemSubsumesParams} from 'term-web/fhir/_lib';
import {CodeSystem} from 'term-web/resources/_lib/code-system/model/code-system';
import {CodeSystemVersion} from 'term-web/resources/_lib/code-system/model/code-system-version';
import {CodeSystemLibModule} from 'term-web/resources/_lib/code-system/code-system-lib.module';
import {
  MuiAlertModule, MuiButtonModule, MuiCardModule, MuiFormModule, MuiIconModule, MuiInputModule,
  MuiPopoverModule, MuiSpinnerModule, MuiTextareaModule
} from '@termx-health/ui';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  templateUrl: './fhir-code-system-subsumes.component.html',
  imports: [
    MuiCardModule, MuiSpinnerModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiButtonModule,
    MuiFormModule, MuiIconModule, MuiPopoverModule, MuiInputModule, MuiTextareaModule, MuiAlertModule,
    FormsModule, JsonPipe, TranslatePipe, CodeSystemLibModule
  ],
})
export class FhirCodeSystemSubsumesComponent {
  private fhirCodeSystemLibService = inject(FhirCodeSystemLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;
  public loading = false;

  public codeSystem?: CodeSystem;
  public versionObj?: CodeSystemVersion;
  public data: {codeA?: string, codeB?: string, system?: string, version?: string} = {};

  protected get baseUrl(): string {
    return `${environment.termxApi}/fhir/CodeSystem`;
  }

  public onSystemSelect(cs: CodeSystem): void {
    this.codeSystem = cs;
    this.data.system = cs?.uri;
    this.data.version = undefined;
    this.versionObj = undefined;
    this.data.codeA = undefined;
    this.data.codeB = undefined;
  }

  public onVersionSelect(v: CodeSystemVersion): void {
    this.versionObj = v;
    // SNOMED needs the edition URI as the version (see $lookup); other code systems use the version string.
    const isSnomed = this.data.system?.startsWith('http://snomed.info/sct');
    this.data.version = (isSnomed && v?.uri) ? v.uri : v?.version;
  }

  public get command(): string {
    const q = this.buildQuery();
    return `GET ${this.baseUrl}/$subsumes${q ? '?' + q : ''}`;
  }

  public subsumes(): void {
    this.loading = true;
    this.error = undefined;
    this.response = undefined;
    this.fhirCodeSystemLibService.subsumes(this.buildParams()).subscribe({
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

  private buildParams(): FhirCodeSystemSubsumesParams {
    const sp = new FhirCodeSystemSubsumesParams();
    sp.codeA = this.data.codeA || undefined;
    sp.codeB = this.data.codeB || undefined;
    sp.system = this.data.system || undefined;
    sp.version = this.data.version || undefined;
    return sp;
  }

  private buildQuery(): string {
    const p = this.buildParams() as Record<string, string | undefined>;
    return Object.keys(p)
      .filter(k => p[k] !== undefined && p[k] !== null && p[k] !== '')
      .map(k => `${k}=${encodeURIComponent(p[k]!)}`)
      .join('&');
  }
}
