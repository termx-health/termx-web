import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ValueSetLibService, ValueSetRule, ValueSetVersion} from 'lib/src/resources';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-value-set-value-set-rule',
  templateUrl: 'value-set-rule-set-value-set-rule.component.html',
})
export class ValueSetRuleSetValueSetRuleComponent implements OnChanges {
  @Input() public includeRule?: ValueSetRule;
  @Input() public excludeRule?: ValueSetRule;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  public valueSet?: string;
  public valueSetVersion?: ValueSetVersion;
  public excludeRuleOn?: boolean;

  public constructor(private valueSetService: ValueSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["includeRule"]?.currentValue) {
      this.initRule(this.includeRule!);
      this.valueSet = this.includeRule?.valueSet;
      if (this.includeRule?.valueSet && this.includeRule.valueSetVersion) {
        this.valueSetService.loadVersion(this.includeRule.valueSet, this.includeRule.valueSetVersion).subscribe(version => {
          this.valueSetVersion = version;
        });
      }
    }
    if (changes["excludeRule"]?.currentValue) {
      this.excludeRuleOn = this.excludeRule!.filters && this.excludeRule!.filters.length > 0;
      this.initRule(this.excludeRule!);
    }
  }

  public initRule(rule: ValueSetRule): void {
    rule.valueSet = rule.valueSet || this.valueSet;
    rule.valueSetVersion = rule.valueSetVersion || this.valueSetVersion?.version;
    rule.concepts = rule.concepts || [];
    rule.filters = rule.filters || [];
  }

  public switchExcludeRule(on: boolean): void {
    if (on) {
      this.initRule(this.excludeRule!);
    } else {
      this.excludeRule!.filters = [];
    }
  }

  public validate(): boolean {
    return validateForm(this.form);
  }

  public valueSetChange(valueSet: string): void {
    if (this.includeRule) {
      this.includeRule.valueSet = valueSet;
    }
    if (this.excludeRule) {
      this.excludeRule.valueSet = valueSet;
    }
  }

  public valueSetVersionChange(valueSetVersion: ValueSetVersion): void {
    if (this.includeRule) {
      this.includeRule.valueSetVersion = valueSetVersion?.version;
    }
    if (this.excludeRule) {
      this.excludeRule.valueSetVersion = valueSetVersion?.version;
    }
  }
}
