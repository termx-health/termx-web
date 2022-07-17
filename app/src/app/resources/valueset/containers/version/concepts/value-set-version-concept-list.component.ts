import {Component, Input} from '@angular/core';
import {ValueSetVersionConcept} from 'terminology-lib/resources';
import {BooleanInput} from '@kodality-web/core-util';
import {ValueSetService} from '../../../services/value-set.service';

@Component({
  selector: 'twa-value-set-version-concept-list',
  templateUrl: 'value-set-version-concept-list.component.html',
})
export class ValueSetVersionConceptListComponent {
  @Input() public codeSystem?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;

  @Input() public valueSet?: string;
  @Input() public concepts: ValueSetVersionConcept[] = [];

  @Input() @BooleanInput() public viewMode: string | boolean = false;

  public constructor(private valueSetService: ValueSetService) { }

  public deleteConcept(id: number): void {
    this.valueSetService.deleteConcept(this.valueSet!, id).subscribe(() => this.concepts = this.concepts.filter(c => c.id !== id));
  }
}
