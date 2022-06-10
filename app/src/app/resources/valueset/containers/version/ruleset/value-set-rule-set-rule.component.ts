import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, CodeSystemVersion, ValueSetLibService, ValueSetRule, ValueSetVersion} from 'lib/src/resources';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-value-set-code-system-rule',
  templateUrl: 'value-set-rule-set-rule.component.html',
})
export class ValueSetRuleSetRuleComponent implements OnChanges {
  @Input() public includeRule?: ValueSetRule;
  @Input() public excludeRule?: ValueSetRule;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  public codeSystem?: string;
  public codeSystemVersion?: CodeSystemVersion;
  public valueSetVersion?: ValueSetVersion;
  public excludeRuleOn?: boolean;

  public constructor(private codeSystemService: CodeSystemLibService, private valueSetService: ValueSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["includeRule"]?.currentValue) {
      this.initRule(this.includeRule!);
      this.codeSystem = this.includeRule?.codeSystem;
      if (this.includeRule?.codeSystem && this.includeRule.codeSystemVersion) {
        this.codeSystemService.loadVersion(this.includeRule.codeSystem, this.includeRule.codeSystemVersion).subscribe(version => {
          this.codeSystemVersion = version;
        });
      }
      if (this.includeRule?.valueSet && this.includeRule.valueSetVersion) {
        this.valueSetService.loadVersion(this.includeRule.valueSet, this.includeRule.valueSetVersion).subscribe(version => {
          this.valueSetVersion = version;
        });
      }
    }
    if (changes["excludeRule"]?.currentValue) {
      this.excludeRuleOn =
        this.excludeRule!.filters && this.excludeRule!.filters.length > 0 ||
        this.excludeRule!.concepts && this.excludeRule!.concepts.length > 0;
      this.initRule(this.excludeRule!);
    }
  }

  public initRule(rule: ValueSetRule): void {
    rule.codeSystem = rule.codeSystem || this.codeSystem;
    rule.codeSystemVersion = rule.codeSystemVersion || this.codeSystemVersion?.version;
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

  public codeSystemChange(codeSystem: string): void {
    if (this.includeRule) {
      this.includeRule.codeSystem = codeSystem;
    }
    if (this.excludeRule) {
      this.excludeRule.codeSystem = codeSystem;
    }
  }

  public codeSystemVersionChange(codeSystemVersion: CodeSystemVersion): void {
    if (this.includeRule) {
      this.includeRule.codeSystemVersion = codeSystemVersion?.version;
    }
    if (this.excludeRule) {
      this.excludeRule.codeSystemVersion = codeSystemVersion?.version;
    }
  }
}
