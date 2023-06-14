import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ValueSetVersionRule} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-value-set-rule-form',
  templateUrl: 'value-set-rule-form.component.html',
})
export class ValueSetRuleFormComponent implements OnChanges{
  @Input() public rule?: ValueSetVersionRule;
  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  protected ruleBase: 'code-system' | 'value-set';
  protected conceptsBase: 'all' | 'exact' | 'filter';

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule) {
      this.rule.concepts ??= [];
      this.rule.filters ??= [];
      this.ruleBase = this.rule.valueSet ? 'value-set' : 'code-system';
      this.conceptsBase = this.rule.filters.length > 0 ? 'filter' : this.rule.concepts.length > 0 ? 'exact' : 'all';
    }
  }

  public validate(): boolean {
    return validateForm(this.form);
  }

  protected conceptsBaseChanged(): void {
    this.rule.concepts = [];
    this.rule.filters = [];
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
}
