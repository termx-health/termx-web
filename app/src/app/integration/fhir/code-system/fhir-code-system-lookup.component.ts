import {Clipboard} from '@angular/cdk/clipboard';
import {Component, OnInit, inject} from '@angular/core';
import {serializeDate} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {FhirCodeSystemLibService, FhirCodeSystemLookupParams} from 'term-web/fhir/_lib';
import {FhirParameters} from 'term-web/fhir/_lib/model/fhir-parameters';
import {CodeSystem} from 'term-web/resources/_lib/code-system/model/code-system';
import {CodeSystemVersion} from 'term-web/resources/_lib/code-system/model/code-system-version';
import {CodeSystemLibModule} from 'term-web/resources/_lib/code-system/code-system-lib.module';
import {VsConceptUtil} from 'term-web/resources/_lib';
import {ValueSetLibService} from 'term-web/resources/_lib/value-set/services/value-set-lib.service';
import {ValueSetVersionConcept} from 'term-web/resources/_lib/value-set/model/value-set-version-concept';
import {
  MuiAlertModule, MuiButtonModule, MuiCardModule, MuiCheckboxModule, MuiDatePickerModule, MuiFormModule,
  MuiIconModule, MuiInputModule, MuiPopoverModule, MuiSelectModule, MuiSpinnerModule, MuiTextareaModule
} from '@termx-health/ui';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';


@Component({
  templateUrl: './fhir-code-system-lookup.component.html',
  imports: [
    MuiCardModule,
    MuiSpinnerModule,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    MuiButtonModule,
    MuiFormModule,
    MuiIconModule,
    MuiPopoverModule,
    MuiTextareaModule,
    MuiInputModule,
    MuiSelectModule,
    MuiCheckboxModule,
    MuiDatePickerModule,
    MuiAlertModule,
    FormsModule,
    JsonPipe,
    TranslatePipe,
    CodeSystemLibModule
  ],
  providers: [ValueSetLibService],
})
export class FhirCodeSystemLookupComponent implements OnInit {
  private fhirCodeSystemLibService = inject(FhirCodeSystemLibService);
  private valueSetService = inject(ValueSetLibService);
  private translate = inject(TranslateService);
  private clipboardService = inject(Clipboard);

  /** All languages from the `languages` value set, keyed by code (for the designation-language picker). */
  private languages: {[code: string]: ValueSetVersionConcept} = {};

  public ngOnInit(): void {
    this.valueSetService.expand({valueSet: 'languages'}).subscribe(concepts => {
      concepts.forEach(c => {
        if (c.concept?.code) { this.languages[c.concept.code] = c; }
      });
    });
  }

  public response?: any;
  public error?: any;
  public loading = false;

  public method: 'GET' | 'POST' = 'GET';

  /** Full objects from the pickers (drive url display + language list). */
  public codeSystem?: CodeSystem;
  public versionObj?: CodeSystemVersion;

  public data: {
    system?: string,
    version?: string,
    code?: string,
    showDesignations?: boolean,
    designationLanguages?: string[],
    date?: Date,
    propertyInput?: string,
    properties?: string[],
  } = {};

  protected get baseUrl(): string {
    return `${environment.termxApi}/fhir/CodeSystem`;
  }

  /**
   * Designation languages: ALL languages (from the `languages` value set) are selectable,
   * but the selected version's supported languages are listed first (tagged "· version").
   */
  public get languageOptions(): {code: string, label: string}[] {
    const lang = this.translate.currentLang;
    const label = (code: string): string => {
      const c = this.languages[code];
      return c ? (VsConceptUtil.getDisplay(c, lang) || code) : code;
    };
    // Version's supported languages first (ordering only — no label decoration), then the rest A–Z.
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

  public onSystemSelect(cs: CodeSystem): void {
    this.codeSystem = cs;
    this.data.system = cs?.uri;
    // Reset dependent fields — version/code/languages belong to the previous code system.
    this.data.version = undefined;
    this.versionObj = undefined;
    this.data.code = undefined;
    this.data.designationLanguages = undefined;
  }

  public onVersionSelect(v: CodeSystemVersion): void {
    this.versionObj = v;
    // For SNOMED the FHIR `version` must be the edition URI (http://snomed.info/sct/<module>[/version/<date>])
    // so the server routes to the correct edition branch — the bare version string (module id) resolves to
    // the International edition and edition-specific concepts come back "not found". Other code systems use
    // their plain version string.
    const isSnomed = this.data.system?.startsWith('http://snomed.info/sct');
    this.data.version = (isSnomed && v?.uri) ? v.uri : v?.version;
  }

  /** GET-or-POST request preview shown in the command text area. */
  public get command(): string {
    if (this.method === 'POST') {
      return `POST ${this.baseUrl}/$lookup\n` + JSON.stringify(this.buildParameters(), null, 2);
    }
    const q = this.buildQuery();
    return `GET ${this.baseUrl}/$lookup${q ? '?' + q : ''}`;
  }

  public lookUp(): void {
    this.loading = true;
    this.error = undefined;
    this.response = undefined;
    const req = this.method === 'POST'
      ? this.fhirCodeSystemLibService.lookupPost(this.buildParameters())
      : this.fhirCodeSystemLibService.lookup(this.buildGetParams());
    req.subscribe({
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
    if (this.data.properties.length === 0) { this.data.properties = undefined; }
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }

  public copyCommand(): void {
    this.clipboardService.copy(this.command);
  }

  private collectProperties(): string[] {
    const props = [...(this.data.properties || [])];
    if (this.data.showDesignations && !props.includes('designation')) {
      props.push('designation');
    }
    return props;
  }

  private buildGetParams(): FhirCodeSystemLookupParams {
    const sp = new FhirCodeSystemLookupParams();
    sp.system = this.data.system || undefined;
    sp.version = this.data.version || undefined;
    sp.code = this.data.code || undefined;
    sp.date = serializeDate(this.data.date);
    const props = this.collectProperties();
    sp.properties = props.length ? props.join(',') : undefined;
    sp.displayLanguage = this.data.designationLanguages?.length ? this.data.designationLanguages.join(',') : undefined;
    return sp;
  }

  private buildQuery(): string {
    const sp = this.buildGetParams() as Record<string, string | undefined>;
    return Object.keys(sp)
      .filter(k => sp[k] !== undefined && sp[k] !== null && sp[k] !== '')
      .map(k => `${k}=${encodeURIComponent(sp[k]!)}`)
      .join('&');
  }

  private buildParameters(): FhirParameters {
    const p: FhirParameters = {resourceType: 'Parameters', parameter: []};
    const add = (name: string, valueString?: string): void => {
      if (valueString) { p.parameter!.push({name, valueString}); }
    };
    add('system', this.data.system);
    add('version', this.data.version);
    add('code', this.data.code);
    add('date', serializeDate(this.data.date));
    add('displayLanguage', this.data.designationLanguages?.length ? this.data.designationLanguages.join(',') : undefined);
    this.collectProperties().forEach(pr => p.parameter!.push({name: 'property', valueString: pr}));
    return p;
  }
}
