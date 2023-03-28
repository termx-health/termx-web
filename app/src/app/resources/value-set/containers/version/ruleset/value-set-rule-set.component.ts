import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ValueSetVersionRule, ValueSetVersionRuleSet} from 'term-web/resources/_lib';
import {BooleanInput, copyDeep} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ValueSetRuleFormComponent} from './rule/value-set-rule-form.component';
import {ValueSetVersionConceptModalComponent} from '../concepts/value-set-version-concept-modal.component';
import {ValueSetService} from '../../../services/value-set.service';

@Component({
  selector: 'tw-value-set-rule-set',
  templateUrl: 'value-set-rule-set.component.html',
})
export class ValueSetRuleSetComponent implements OnChanges {
  @Input() public valueSetId?: string;
  @Input() public valueSetVersion?: string;
  @Input() public ruleSet?: ValueSetVersionRuleSet;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild("ruleComponent") public ruleComponent?: ValueSetRuleFormComponent;
  @ViewChild("conceptModal") public conceptModal?: ValueSetVersionConceptModalComponent;

  public constructor(private valueSetService: ValueSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["ruleSet"]) {
      this.initRuleSet();
    }
  }

  private initRuleSet(): void {
    this.ruleSet = this.ruleSet || new ValueSetVersionRuleSet();
    this.ruleSet.rules = this.ruleSet.rules || [];
  }

  public deleteRule(id: number): void {
    this.valueSetService.deleteRule(this.valueSetId!, id).subscribe(() => this.ruleSet!.rules = this.ruleSet!.rules!.filter(r => r.id !== id));
  }

  public getRuleSet(): ValueSetVersionRuleSet {
    return this.ruleSet!;
  }

  public expand(rule?: ValueSetVersionRule): void {
    const ruleSet = copyDeep(this.ruleSet);
    if (rule) {
      ruleSet!.rules = [rule];
    }
    this.valueSetService.expand({valueSet: this.valueSetId, valueSetVersion: this.valueSetVersion, ruleSet: ruleSet}).subscribe(vsConcepts => {
      this.conceptModal?.toggleModal(vsConcepts);
    });
  }
}
