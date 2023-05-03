import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import {CodeSystemLibService, ValueSetLibService, ValueSetVersionConcept, ValueSetVersionRule} from 'term-web/resources/_lib';
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

  protected rowInstance: ValueSetVersionConcept = {additionalDesignations: [], display: {}};
  protected vsConcepts: ValueSetVersionConcept[];
  protected showPredefinedConcepts: boolean;

  @ViewChild("form") public form?: NgForm;

  public constructor(private valueSetService: ValueSetLibService, private codeSystemService: CodeSystemLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['valueSet'] || changes['valueSetVersion']) && this.valueSet && this.valueSetVersion) {
      this.valueSetService.loadVersion(this.valueSet, this.valueSetVersion).subscribe(version => {
        this.vsConcepts = version.concepts;
      });
    }

    if (changes['rule'] && this.rule?.codeSystem) {
      if (['snomed-ct', 'ucum', 'observation-definition'].includes(this.rule.codeSystem)) {
        return;
      }
      this.codeSystemService.load(this.rule.codeSystem).subscribe(cs => this.showPredefinedConcepts = cs.content === 'not-present');
    }
  }


  protected removeDesignation(c: ValueSetVersionConcept, i: number): void {
    c.additionalDesignations?.splice(i, 1);
    c.additionalDesignations = [...c.additionalDesignations];
  }

  protected addDesignation(c: ValueSetVersionConcept): void {
    c.additionalDesignations = [...(c.additionalDesignations || []), {}];
  }
}
