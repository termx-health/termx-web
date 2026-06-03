import {Clipboard} from '@angular/cdk/clipboard';
import {Component, OnInit, inject} from '@angular/core';
import {environment} from 'environments/environment';
import {FhirValueSetExpandParams, FhirValueSetLibService} from 'term-web/fhir/_lib';
import {ValueSet} from 'term-web/resources/_lib/value-set/model/value-set';
import {ValueSetVersion} from 'term-web/resources/_lib/value-set/model/value-set-version';
import {ValueSetVersionConcept} from 'term-web/resources/_lib/value-set/model/value-set-version-concept';
import {ValueSetLibModule} from 'term-web/resources/_lib/value-set/value-set-lib.module';
import {ValueSetLibService} from 'term-web/resources/_lib/value-set/services/value-set-lib.service';
import {VsConceptUtil} from 'term-web/resources/_lib';
import {
  MuiAlertModule, MuiButtonModule, MuiCardModule, MuiCheckboxModule, MuiFormModule, MuiIconModule,
  MuiPopoverModule, MuiSelectModule, MuiSpinnerModule, MuiTextareaModule
} from '@termx-health/ui';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';


@Component({
  templateUrl: './fhir-value-set-expand.component.html',
  imports: [
    MuiCardModule, MuiSpinnerModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiButtonModule,
    MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiCheckboxModule, MuiSelectModule,
    MuiAlertModule, FormsModule, JsonPipe, TranslatePipe, ValueSetLibModule
  ],
  providers: [ValueSetLibService],
})
export class FhirValueSetExpandComponent implements OnInit {
  private fhirValueSetService = inject(FhirValueSetLibService);
  private valueSetService = inject(ValueSetLibService);
  private translate = inject(TranslateService);
  private clipboardService = inject(Clipboard);

  /** All languages from the `languages` value set, keyed by code (for the designation-language picker). */
  private languages: {[code: string]: ValueSetVersionConcept} = {};

  public response?: any;
  public error?: any;
  public loading = false;

  public valueSet?: ValueSet;
  public versionObj?: ValueSetVersion;
  public data = new FhirValueSetExpandParams();
  public designationLanguages?: string[];

  public ngOnInit(): void {
    this.valueSetService.expand({valueSet: 'languages'}).subscribe(concepts => {
      concepts.forEach(c => {
        if (c.concept?.code) { this.languages[c.concept.code] = c; }
      });
    });
  }

  protected get baseUrl(): string {
    return `${environment.termxApi}/fhir/ValueSet`;
  }

  /**
   * Designation languages: ALL languages (from the `languages` value set) are selectable,
   * but the selected version's supported languages are listed first.
   */
  public get languageOptions(): {code: string, label: string}[] {
    const lang = this.translate.currentLang;
    const label = (code: string): string => {
      const c = this.languages[code];
      return c ? (VsConceptUtil.getDisplay(c, lang) || code) : code;
    };
    const out: {code: string, label: string}[] = [];
    const seen = new Set<string>();
    (this.versionObj?.supportedLanguages || []).forEach(code => {
      if (!seen.has(code)) { seen.add(code); out.push({code, label: label(code)}); }
    });
    Object.keys(this.languages)
      .filter(code => !seen.has(code))
      .map(code => ({code, label: label(code)}))
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach(o => out.push(o));
    return out;
  }

  public onValueSetSelect(vs: ValueSet): void {
    this.valueSet = vs;
    this.data.url = vs?.uri;
    this.data.valueSetVersion = undefined;
    this.versionObj = undefined;
    this.designationLanguages = undefined;
  }

  public onVersionSelect(v: ValueSetVersion): void {
    this.versionObj = v;
    this.data.valueSetVersion = v?.version;
  }

  public get command(): string {
    const q = this.buildQuery();
    return `GET ${this.baseUrl}/$expand${q ? '?' + q : ''}`;
  }

  public expand(): void {
    this.loading = true;
    this.error = undefined;
    this.response = undefined;
    this.fhirValueSetService.expand(this.buildParams()).subscribe({
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

  private buildParams(): FhirValueSetExpandParams {
    const p = new FhirValueSetExpandParams();
    p.url = this.data.url || undefined;
    p.valueSetVersion = this.data.valueSetVersion || undefined;
    p.includeDesignations = this.data.includeDesignations || undefined;
    p.displayLanguage = this.designationLanguages?.length ? this.designationLanguages.join(',') : undefined;
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
