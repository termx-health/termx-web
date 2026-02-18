import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { compareValues, LoadingManager, validateForm, ApplyPipe } from '@kodality-web/core-util';
import {FhirValueSetLibService} from 'term-web/fhir/_lib';
import {ValueSetVersion, ValueSetVersionRuleSet} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {map, Observable} from 'rxjs';
import { MuiSpinnerModule, MuiCardModule, MuiFormModule, MuiDatePickerModule, MuiMultiLanguageInputModule, MuiDividerModule, MuiCheckboxModule, MarinPageLayoutModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { AsyncPipe } from '@angular/common';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { ResourceIdentifiersComponent } from 'term-web/resources/resource/components/resource-identifiers.component';
import { ValueSetVersionRuleSetWidgetComponent } from 'term-web/resources/value-set/containers/version/widgets/value-set-version-rule-set-widget.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'value-set-version-edit.component.html',
    imports: [
    MuiSpinnerModule,
    MuiCardModule,
    StatusTagComponent,
    FormsModule,
    MuiFormModule,
    SemanticVersionSelectComponent,
    MuiDatePickerModule,
    ValueSetConceptSelectComponent,
    MuiMultiLanguageInputModule,
    ResourceIdentifiersComponent,
    MuiDividerModule,
    MuiCheckboxModule,
    ValueSetVersionRuleSetWidgetComponent,
    MarinPageLayoutModule,
    MuiButtonModule,
    AsyncPipe,
    TranslatePipe,
    ApplyPipe
],
})
export class ValueSetVersionEditComponent implements OnInit {
  private valueSetService = inject(ValueSetService);
  private fhirValueSetService = inject(FhirValueSetLibService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;

  public mode: 'add' | 'edit' = 'add';
  public loader = new LoadingManager();


  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.valueSetVersion = this.route.snapshot.paramMap.get('versionCode');
    this.mode = this.valueSetId && this.valueSetVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.valueSetId!, this.valueSetVersion!);
    } else {
      this.valueSetService.searchVersions(this.valueSetId).subscribe(r => {
        const lastVersion = this.getLastVersion(r.data);
        const newVersion= new ValueSetVersion();
        newVersion.supportedLanguages = lastVersion?.supportedLanguages;
        newVersion.preferredLanguage = lastVersion?.preferredLanguage;
        this.version = this.writeVersion(newVersion);
      });
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loader.wrap('init', this.valueSetService.loadVersion(id, version)).subscribe(version => {
      this.version = this.writeVersion(version);
    });
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.version.status = 'draft';
    this.loader.wrap('save', this.valueSetService.saveValueSetVersion(this.valueSetId!, this.version))
      .subscribe(() => this.router.navigate(['/resources/value-sets', this.valueSetId, 'versions', this.version.version, 'summary'], {replaceUrl: true}));
  }

  public get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }

  public versions = (id): Observable<string[]> => {
    return this.valueSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };

  private writeVersion(version: ValueSetVersion): ValueSetVersion {
    version.status ??= 'draft';
    version.releaseDate ??= new Date();
    version.ruleSet ??= new ValueSetVersionRuleSet();
    version.ruleSet.inactive ??= false;
    version.identifiers ??= [];
    return version;
  }

  private getLastVersion(versions: ValueSetVersion[]): ValueSetVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }
}
