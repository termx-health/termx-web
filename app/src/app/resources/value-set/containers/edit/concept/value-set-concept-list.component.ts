import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetVersionConcept} from 'term-web/resources/_lib';
import {ValueSetService} from '../../../services/value-set.service';

@Component({
  selector: 'tw-value-set-concept-list',
  templateUrl: './value-set-concept-list.component.html',
})
export class ValueSetConceptListComponent implements OnChanges {
  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;

  public searchInput: string = "";
  public concepts: ValueSetVersionConcept[] = [];

  public loading = false;

  public constructor(private valueSetService: ValueSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['valueSet'] || changes['valueSetVersion']) && this.valueSet) {
      this.loadData();
    }
  }

  public loadData(): void {
    this.loading = true;
    this.valueSetService.expand({valueSet: this.valueSet, valueSetVersion: this.valueSetVersion})
      .subscribe(concepts => this.concepts = concepts)
      .add(() => this.loading = false);
  }

  public filterConcepts = (concepts: ValueSetVersionConcept[], searchInput: string): ValueSetVersionConcept[] => {
    return concepts.filter(c => this.contains([c.concept?.code, c.display?.name, ...(c.additionalDesignations ? c.additionalDesignations.map(d => d.name) : [])], searchInput));
  };

  private contains(names: (string | undefined)[], searchInput: string): boolean {
    return !!names.find(n => n && n.toLowerCase().includes(searchInput.toLowerCase()));
  }
}
