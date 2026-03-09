import { Component, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, validateForm, ApplyPipe, JoinPipe } from '@kodality-web/core-util';
import {CodeSystemLibService, EntityProperty, ValueSetVersionRule} from 'term-web/resources/_lib';
import {map, Observable} from 'rxjs';
import {ValueSetRuleConceptListComponent} from 'term-web/resources/value-set/containers/version/rule/concept/value-set-rule-concept-list.component';
import {ValueSetRuleFilterListComponent} from 'term-web/resources/value-set/containers/version/rule/filter/value-set-rule-filter-list.component';
import { AsyncPipe } from '@angular/common';
import { MuiFormModule, MuiRadioModule, MuiSelectModule } from '@kodality-web/marina-ui';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ValueSetRuleConceptListComponent as ValueSetRuleConceptListComponent_1 } from 'term-web/resources/value-set/containers/version/rule/concept/value-set-rule-concept-list.component';
import { ValueSetRuleFilterListComponent as ValueSetRuleFilterListComponent_1 } from 'term-web/resources/value-set/containers/version/rule/filter/value-set-rule-filter-list.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { ValueSetVersionSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-version-select.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-value-set-rule-form',
    templateUrl: 'value-set-rule-form.component.html',
    imports: [
    FormsModule,
    MuiFormModule,
    MuiRadioModule,
    CodeSystemSearchComponent,
    CodeSystemVersionSelectComponent,
    MuiSelectModule,
    ValueSetRuleConceptListComponent_1,
    ValueSetRuleFilterListComponent_1,
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent,
    AsyncPipe,
    TranslatePipe,
    ApplyPipe,
    JoinPipe
],
})
export class ValueSetRuleFormComponent implements OnChanges{
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public rule?: ValueSetVersionRule;
  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: boolean;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ValueSetRuleFilterListComponent) public valueSetRuleFilterListComponent?: ValueSetRuleFilterListComponent;
  @ViewChild(ValueSetRuleConceptListComponent) public valueSetRuleConceptListComponent?: ValueSetRuleConceptListComponent;

  protected ruleBase: 'code-system' | 'value-set';
  protected conceptsBase: 'all' | 'exact' | 'filter';

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule) {
      this.rule.concepts ??= [];
      this.rule.filters ??= [];
      this.ruleBase = this.rule.valueSet ? 'value-set' : 'code-system';
      this.conceptsBase = this.rule.filters.length > 0 ? 'filter' : this.rule.concepts.length > 0 ? 'exact' : 'all';
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
      return ;
    }
    return this.codeSystemService.load(cs).pipe(map(cs => cs.properties));
  };
}
