import { AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ApplyPipe, BooleanInput, JoinPipe, LoadingManager, validateForm } from '@kodality-web/core-util';
import { MarinPageLayoutModule, MuiButtonModule, MuiCardModule, MuiFormModule, MuiIconModule, MuiNoDataModule, MuiRadioModule, MuiSelectModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { CodeSystemLibService, EntityProperty, ValueSetLibService, ValueSetVersionConcept, ValueSetVersionRule } from 'term-web/resources/_lib';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { ValueSetVersionSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-version-select.component';
import { ValueSetRuleConceptListComponent } from 'term-web/resources/value-set/containers/version/rule/concept/value-set-rule-concept-list.component';
import { ValueSetRuleFilterListComponent } from 'term-web/resources/value-set/containers/version/rule/filter/value-set-rule-filter-list.component';

@Component({
    selector: 'tw-value-set-rule-form',
    templateUrl: 'value-set-rule-form.component.html',
    imports: [
        FormsModule,
        MuiButtonModule,
        MuiCardModule,
        MarinPageLayoutModule,
        MuiFormModule,
        MuiIconModule,
        MuiNoDataModule,
        MuiRadioModule,
        CodeSystemSearchComponent,
        CodeSystemVersionSelectComponent,
        MuiSelectModule,
        ValueSetRuleConceptListComponent,
        ValueSetRuleFilterListComponent,
        ValueSetSearchComponent,
        ValueSetVersionSelectComponent,
        AsyncPipe,
        TranslatePipe,
        ApplyPipe,
        JoinPipe
    ],
})
export class ValueSetRuleFormComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemLibService);
  private valueSetService = inject(ValueSetLibService);

  @Input() public rule?: ValueSetVersionRule;
  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: boolean;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild('form') public form?: NgForm;
  @ViewChild(ValueSetRuleFilterListComponent) public valueSetRuleFilterListComponent?: ValueSetRuleFilterListComponent;
  @ViewChild(ValueSetRuleConceptListComponent) public valueSetRuleConceptListComponent?: ValueSetRuleConceptListComponent;

  protected ruleBase: 'code-system' | 'value-set';
  protected conceptsBase: 'all' | 'exact' | 'filter';
  protected expansionPreview?: ValueSetVersionConcept[];
  protected expansionPreviewLoaded = false;
  protected loader = new LoadingManager();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule) {
      this.rule.concepts ??= [];
      this.rule.filters ??= [];
      this.ruleBase = this.rule.valueSet ? 'value-set' : 'code-system';
      this.conceptsBase = this.rule.filters.length > 0 ? 'filter' : this.rule.concepts.length > 0 ? 'exact' : 'all';
    }
    if (changes['rule'] || changes['inactiveConcepts']) {
      this.expansionPreview = undefined;
      this.expansionPreviewLoaded = false;
    }
  }

  public validate(): boolean {
    return validateForm(this.form) &&
      (!this.valueSetRuleFilterListComponent || this.valueSetRuleFilterListComponent.validate()) &&
      (!this.valueSetRuleConceptListComponent || this.valueSetRuleConceptListComponent.validate());
  }

  protected conceptsBaseChanged(): void {
    this.rule.concepts = [];
    this.rule.filters = [];
    if (this.conceptsBase === 'filter') {
      this.rule.codeSystemVersion = {};
    }
  }

  public ruleBaseChanged(base: 'code-system' | 'value-set'): void {
    if (base !== 'code-system') {
      this.rule.concepts = [];
      this.rule.filters = [];
      this.rule.codeSystem = undefined;
      this.rule.codeSystemVersion = {};
    }

    if (base !== 'value-set') {
      this.rule.valueSet = undefined;
      this.rule.valueSetVersion = {};
    }
  }

  protected loadProperties = (cs: string): Observable<EntityProperty[]> => {
    if (!cs) {
      return;
    }
    return this.codeSystemService.load(cs).pipe(map(codeSystem => codeSystem.properties));
  };

  protected previewExpansion(): void {
    if (!this.rule || !this.canPreviewExpansion()) {
      return;
    }
    this.loader.wrap('preview-expansion', this.valueSetService.expandRule({
      valueSet: this.valueSet,
      valueSetVersion: this.valueSetVersion,
      inactiveConcepts: !!this.inactiveConcepts,
      rule: this.rule
    })).subscribe(expansion => {
      this.expansionPreview = expansion;
      this.expansionPreviewLoaded = true;
    });
  }

  protected canPreviewExpansion(): boolean {
    if (this.rule?.type !== 'include') {
      return false;
    }
    return !!this.rule.codeSystem || !!this.rule.valueSet;
  }
}
