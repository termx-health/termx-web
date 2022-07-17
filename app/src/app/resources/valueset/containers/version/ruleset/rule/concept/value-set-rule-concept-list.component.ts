import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BooleanInput, copyDeep, isDefined} from '@kodality-web/core-util';
import {ValueSetVersionConcept} from 'lib/src/resources';

@Component({
  selector: 'twa-value-set-rule-concept-list',
  templateUrl: 'value-set-rule-concept-list.component.html',
})
export class ValueSetRuleConceptListComponent {
  @Input() public codeSystem?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() public concepts: ValueSetVersionConcept[] = [];
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Output() public conceptsChange: EventEmitter<ValueSetVersionConcept[]> = new EventEmitter<ValueSetVersionConcept[]>();

  public modalData: {
    visible?: boolean,
    index?: number,
    concept?: ValueSetVersionConcept
  } = {};

  public constructor() { }

  public addRow(): void {
    this.concepts = [...this.concepts || []];
    this.toggleModal({});
  }

  public removeRow(index: number): void {
    this.concepts.splice(index, 1);
    this.concepts = [...this.concepts];
    this.conceptsChange.emit(this.concepts);
  }

  public toggleModal(concept?: ValueSetVersionConcept, index?: number): void {
    this.modalData = {
      visible: !!concept,
      concept: copyDeep(concept),
      index: index,
    };
  }

  public confirmModalConcept(): void {
    if (isDefined(this.modalData.index)) {
      this.concepts[this.modalData.index!] = this.modalData.concept!;
      this.concepts = [...this.concepts];
    } else {
      this.concepts = [...this.concepts, this.modalData.concept!];
    }

    this.conceptsChange.emit(this.concepts);
    this.modalData.visible = false;
  }
}
