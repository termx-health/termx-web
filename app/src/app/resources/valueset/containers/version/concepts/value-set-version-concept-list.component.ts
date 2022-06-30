import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CodeSystemConcept, ValueSetConcept} from 'terminology-lib/resources';
import {BooleanInput} from '@kodality-web/core-util';

@Component({
  selector: 'twa-value-set-version-concept-list',
  templateUrl: 'value-set-version-concept-list.component.html',
})
export class ValueSetVersionConceptListComponent {
  @Input() public codeSystem?: string;
  @Input() public codeSystemVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;

  @Input() public concepts: ValueSetConcept[] = [];

  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Output() public conceptsChange: EventEmitter<ValueSetConcept[]> = new EventEmitter<ValueSetConcept[]>();

  public constructor() { }

  public addRow(): void {
    this.concepts.push(new ValueSetConcept());
    this.concepts = [...this.concepts];
    this.conceptsChange.emit(this.concepts);
  }

  public removeRow(index: number): void {
    this.concepts.splice(index, 1);
    this.concepts = [...this.concepts];
    this.conceptsChange.emit(this.concepts);
  }

  public hasActiveVersion = (concept: CodeSystemConcept): boolean => {
    return !!concept && !!concept.versions && !!concept.versions.find(v => v.status === 'active');
  };
}
