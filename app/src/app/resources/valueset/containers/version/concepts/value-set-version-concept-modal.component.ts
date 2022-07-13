import {Component} from '@angular/core';
import {CodeSystemConcept, ValueSetConcept} from 'terminology-lib/resources';


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

  public hasActiveVersion = (concept: CodeSystemConcept): boolean => {
    return !concept || !!concept.versions && !!concept.versions.find(v => v.status === 'active');
  };
}
