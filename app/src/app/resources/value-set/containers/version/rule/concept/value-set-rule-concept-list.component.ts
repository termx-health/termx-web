import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {CodeSystemLibService, ValueSetLibService, ValueSetVersionConcept, ValueSetVersionRule} from 'app/src/app/resources/_lib';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-value-set-rule-concept-list',
  templateUrl: 'value-set-rule-concept-list.component.html',
})
export class ValueSetRuleConceptListComponent implements OnChanges {
  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() public rule?: ValueSetVersionRule;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  protected rowInstance: ValueSetVersionConcept = {additionalDesignations: [], display: {}, concept: {}};
  protected csContentPresent: boolean = true;

  @ViewChild("form") public form?: NgForm;

  public constructor(private valueSetService: ValueSetLibService, private codeSystemService: CodeSystemLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule?.codeSystem) {
      if (['snomed-ct', 'ucum', 'observation-definition'].includes(this.rule.codeSystem)) {
        return;
      }
      this.codeSystemService.load(this.rule.codeSystem).subscribe(cs => {
        this.csContentPresent = cs.content !== 'not-present';
      });
    }
  }

  protected removeDesignation(c: ValueSetVersionConcept, i: number): void {
    c.additionalDesignations?.splice(i, 1);
    c.additionalDesignations = [...c.additionalDesignations];
  }

  protected addDesignation(c: ValueSetVersionConcept): void {
    c.additionalDesignations = [...(c.additionalDesignations || []), {}];
  }

  public validate(): boolean {
    return validateForm(this.form);
  }
}
