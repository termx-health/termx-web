import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {copyDeep, isDefined} from '@kodality-web/core-util';
import {ValueSetVersionConcept} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-map-set-unmapped-concepts',
  templateUrl: 'dev-map-set-unmapped-concept-list.component.html',
  styles: [`
    .selected-item {
      border-color: #1464C0 !important;
      background: #1464C0 !important;
      color: #fff;
    }`
  ]
})

export class DevMapSetUnmappedConceptListComponent implements OnChanges {
  @Input() public unmappedConcepts: ValueSetVersionConcept[] = [];
  protected conceptToAdd?: ValueSetVersionConcept;
  public concepts?: ValueSetVersionConcept[];
  public selectedConcept?: ValueSetVersionConcept;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['unmappedConcepts']) {
      this.concepts = this.concepts?.filter(c => this.unmappedConcepts?.find(uc => uc.concept.code === c.concept.code)) || [];
    }
  }

  public populate(): void {
    this.concepts = [...copyDeep(this.unmappedConcepts)];
  };

  public removeConcept = (concept: ValueSetVersionConcept): void => {
    this.concepts = [...this.concepts!.filter(c => c !== concept)];
  };

  public notUsed(concepts: ValueSetVersionConcept[], usedConcepts: ValueSetVersionConcept[]): ValueSetVersionConcept[] {
    return concepts?.filter(c => !usedConcepts?.find(uc => uc.concept?.id === c.concept?.id));
  }

  protected addConcept(concept: ValueSetVersionConcept): void {
    if (isDefined(concept)) {
      this.concepts = [...(this.concepts || []), concept];
      this.selectedConcept = concept;
    }
  }

  protected selectConcept(concept: ValueSetVersionConcept): void {
    this.selectedConcept = concept;
  }
}
