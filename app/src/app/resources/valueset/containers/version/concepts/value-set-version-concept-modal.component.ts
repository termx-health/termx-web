import {Component} from '@angular/core';
import {ValueSetVersionConcept} from '@terminology/core';


@Component({
  selector: 'twa-value-set-version-concept-modal',
  templateUrl: './value-set-version-concept-modal.component.html',
})
export class ValueSetVersionConceptModalComponent {
  public modalVisible = false;
  public concepts?: ValueSetVersionConcept[];

  public constructor() {}

  public toggleModal(concepts?: ValueSetVersionConcept[]): void {
    this.modalVisible = !!concepts;
    this.concepts = concepts;
  }
}
