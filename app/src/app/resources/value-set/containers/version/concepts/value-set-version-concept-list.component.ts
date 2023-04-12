import {Component, Input, ViewChild} from '@angular/core';
import {Designation, ValueSetVersionConcept} from 'term-web/resources/_lib';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-value-set-version-concept-list',
  templateUrl: 'value-set-version-concept-list.component.html',
})
export class ValueSetVersionConceptListComponent {
  @Input() public codeSystem?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;

  @Input() public valueSet?: string;
  @Input() public concepts: ValueSetVersionConcept[] = [];
  public rowInstance: ValueSetVersionConcept = {concept: {}, display: {}};

  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public getConcepts(): ValueSetVersionConcept[] {
    return this.concepts;
  }

  protected addDesignation(concept: ValueSetVersionConcept): void {
    concept.additionalDesignations = [...(concept.additionalDesignations || []), new Designation()];
  }

  protected deleteDesignation(concept: ValueSetVersionConcept, index: number): void {
    concept.additionalDesignations.splice(index, 1);
  }
}
