import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ValueSetLibService, ValueSetRule, ValueSetRuleSet} from 'terminology-lib/resources';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ValueSetRuleSetRuleComponent} from './value-set-rule-set-rule.component';
import {ValueSetVersionConceptModalComponent} from '../concepts/value-set-version-concept-modal.component';

@Component({
  selector: 'twa-value-set-rule-set',
  templateUrl: 'value-set-rule-set.component.html',
})
export class ValueSetRuleSetComponent implements OnChanges {
  @Input() public ruleSet?: ValueSetRuleSet;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild("ruleComponent") public ruleComponent?: ValueSetRuleSetRuleComponent;
  @ViewChild("conceptModal") public conceptModal?: ValueSetVersionConceptModalComponent;

  public rules: {include: ValueSetRule, exclude?: ValueSetRule}[] = [];
  public modalData: {visible?: boolean, ruleIndex?: number, rule?: {include: ValueSetRule, exclude?: ValueSetRule}} = {};

  public constructor(private valueSetService: ValueSetLibService) {}

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
      this.rules.push({include: include, exclude: exclude ? exclude : new ValueSetRule()});
    });
  }

  public addRule(): void {
    this.toggleModal({include: new ValueSetRule(), exclude: new ValueSetRule()});
  }

  public deleteRule(index: number): void {
    this.rules.splice(index, 1);
    this.rules = [...this.rules];
  }

  public toggleModal(rule?: {include: ValueSetRule, exclude?: ValueSetRule}, index?: number): void {
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

    this.modalData.visible = false;
  }

  private validate(): boolean {
    return validateForm(this.form) && (!this.ruleComponent || this.ruleComponent.validate());
  }

  public getRuleSet(): ValueSetRuleSet {
    this.ruleSet!.includeRules = [];
    this.ruleSet!.excludeRules = [];
    this.rules.forEach(r => {
      this.ruleSet!.includeRules?.push(r.include);
      if (r.exclude && (r.exclude.concepts && r.exclude.concepts.length > 0 || r.exclude.filters && r.exclude.filters.length > 0)) {
        this.ruleSet!.excludeRules?.push(r.exclude);
      }
    });
    return this.ruleSet!;
  }

  public expand(rule?: {include: ValueSetRule, exclude?: ValueSetRule}): void {
    const ruleSet = this.getRuleSet();
    if (!!rule) {
      ruleSet.includeRules = rule.include ? [rule.include] : [];
      ruleSet.excludeRules = [];
      if (rule.exclude && (rule.exclude.concepts && rule.exclude.concepts.length > 0 || rule.exclude.filters && rule.exclude.filters.length > 0)) {
        ruleSet.excludeRules = [rule.exclude];
      }
    }
    this.valueSetService.expand({ruleSet: ruleSet}).subscribe(vsConcepts => {
      this.conceptModal?.toggleModal(vsConcepts);
    });
  }
}
