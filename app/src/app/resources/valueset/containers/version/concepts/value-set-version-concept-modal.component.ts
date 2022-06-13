import {Component} from '@angular/core';
import {ValueSetConcept} from 'terminology-lib/resources';


@Component({
  selector: 'twa-value-set-version-concept-modal',
  templateUrl: './value-set-version-concept-modal.component.html',
})
export class ValueSetVersionConceptModalComponent {
  public modalVisible = false;
  public concepts?: ValueSetConcept[];

  public constructor() {}

  public toggleModal(concepts?: ValueSetConcept[]): void {
    this.modalVisible = !!concepts;
    this.concepts = concepts;
  }
}
