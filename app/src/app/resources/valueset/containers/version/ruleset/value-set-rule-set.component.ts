import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ValueSetRule, ValueSetRuleSet} from 'lib/src/resources';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ValueSetRuleSetCodeSystemRuleComponent} from './value-set-rule-set-code-system-rule.component';
import {ValueSetRuleSetValueSetRuleComponent} from './value-set-rule-set-value-set-rule.component';

@Component({
  selector: 'twa-value-set-rule-set',
  templateUrl: 'value-set-rule-set.component.html',
})
export class ValueSetRuleSetComponent implements OnChanges {
  @Input() public ruleSet?: ValueSetRuleSet;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild("codeSystemRuleComponent") public codeSystemRuleComponent?: ValueSetRuleSetCodeSystemRuleComponent;
  @ViewChild("valueSetRuleComponent") public valueSetRuleComponent?: ValueSetRuleSetValueSetRuleComponent;

  public rules: {include: ValueSetRule, exclude?: ValueSetRule, type: 'code-system' | 'value-set'}[] = [];
  public modalData: {visible?: boolean, ruleIndex?: number, rule?: {include: ValueSetRule, exclude?: ValueSetRule, type: 'code-system' | 'value-set'}} = {};

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["ruleSet"]) {
      this.initRuleSet();
      this.groupRules();
    }
  }

  private initRuleSet(): void {
    this.ruleSet = this.ruleSet || new ValueSetRuleSet();
    this.ruleSet.includeRules = this.ruleSet.includeRules || [];
    this.ruleSet.excludeRules = this.ruleSet.excludeRules || undefined;
  }

  private groupRules(): void {
    this.rules = [];
    if (!this.ruleSet) {
      return;
    }
    this.ruleSet.includeRules?.forEach(include => {
      const exclude = this.ruleSet?.excludeRules?.find(exclude => {
        const sameCs = !!include.codeSystem && exclude.codeSystem === include.codeSystem && exclude.codeSystemVersion === include.codeSystemVersion;
        const sameVs = !!include.valueSet && exclude.valueSet === include.valueSet && exclude.valueSetVersion === include.valueSetVersion;
        return sameCs || sameVs;
      });
      this.rules.push({include: include, exclude: exclude ? exclude : new ValueSetRule(), type: include.codeSystem ? 'code-system' : 'value-set'});
    });
  }

  public addRule(ruleType: 'code-system' | 'value-set'): void {
    this.toggleModal({include: new ValueSetRule(), exclude: new ValueSetRule(), type: ruleType});
  }

  public deleteRule(index: number): void {
    this.rules.splice(index, 1);
    this.rules = [...this.rules];
  }

  public toggleModal(rule?: {include: ValueSetRule, exclude?: ValueSetRule, type: 'code-system' | 'value-set'}, index?: number): void {
    this.modalData = {
      visible: !!rule,
      rule: copyDeep(rule),
      ruleIndex: index,
    };
  }

  public confirmModalRuleSet(): void {
    if (!this.validate()) {
      return;
    }
    if (isDefined(this.modalData.ruleIndex)) {
      this.rules[this.modalData.ruleIndex!] = this.modalData.rule!;
    } else {
      this.rules = [...this.rules, this.modalData.rule!];
    }
    this.toggleModal();
  }

  private validate(): boolean {
    return validateForm(this.form) &&
      (!this.codeSystemRuleComponent || this.codeSystemRuleComponent.validate()) &&
      (!this.valueSetRuleComponent || this.valueSetRuleComponent.validate());
  }

  public getRuleSet(): ValueSetRuleSet {
    this.ruleSet!.includeRules = [];
    this.ruleSet!.excludeRules = [];
    this.rules.forEach(r => {
      this.ruleSet!.includeRules?.push(r.include);
      if (r.exclude) {
        this.ruleSet!.excludeRules?.push(r.exclude);
      }
    });
    return this.ruleSet!;
  }
}
