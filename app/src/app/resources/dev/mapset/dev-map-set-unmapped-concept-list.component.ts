import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {copyDeep, isDefined} from '@kodality-web/core-util';
import {CodeSystemConcept} from 'term-web/resources/_lib';

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
  @Input() public unmappedConcepts: CodeSystemConcept[] = [];
  protected conceptToAdd?: CodeSystemConcept;
  public concepts?: CodeSystemConcept[];
  public selectedConcept?: CodeSystemConcept;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['unmappedConcepts']) {
      this.concepts = this.concepts?.filter(c => this.unmappedConcepts?.find(uc => uc.code === c.code)) || [];
    }
  }

  public populate(): void {
    this.concepts = [...copyDeep(this.unmappedConcepts)];
  };

  public removeConcept = (concept: CodeSystemConcept): void => {
    this.concepts = [...this.concepts!.filter(c => c !== concept)];
  };

  public notUsed(concepts: CodeSystemConcept[], usedConcepts: CodeSystemConcept[]): CodeSystemConcept[] {
    return concepts?.filter(c => !usedConcepts?.find(uc => uc?.id === c?.id));
  }

  protected addConcept(concept: CodeSystemConcept): void {
    if (isDefined(concept)) {
      this.concepts = [...(this.concepts || []), concept];
      this.selectedConcept = concept;
    }
  }

  protected selectConcept(concept: CodeSystemConcept): void {
    this.selectedConcept = concept;
  }
}
