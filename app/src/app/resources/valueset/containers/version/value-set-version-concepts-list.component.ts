import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetService} from '../../services/value-set.service';
import {Concept, Designation} from 'terminology-lib/resources';
import {forkJoin} from 'rxjs';
import {unique} from '@kodality-web/core-util';

@Component({
  selector: 'twa-value-set-version-concepts-list',
  templateUrl: 'value-set-version-concepts-list.component.html',
})
export class ValueSetVersionConceptsListComponent implements OnChanges {
  @Input() public valueSetId?: string;
  @Input() public valueSetVersion?: string;

  public data: {concept?: Concept, designation?: Designation}[] = [];
  public loading = false;

  public constructor(private valueSetService: ValueSetService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSetId"] || changes["versionVersion"]) {
      this.loadConcepts();
    }
  }

  public loadConcepts(): void {
    if (!this.valueSetId || !this.valueSetVersion) {
      return;
    }
    this.loading = true;
    forkJoin([
      this.valueSetService.loadConcepts(this.valueSetId, this.valueSetVersion),
      this.valueSetService.loadDesignations(this.valueSetId, this.valueSetVersion)
    ]).subscribe(([concepts, designations]) => {
      this.prepareData(concepts, designations);
    }).add(() => this.loading = false);
  }

  public prepareData(concepts: Concept[], designations: Designation[]): void {
    const designationsIds: number[] = designations.map(d => d.id!).filter(unique);

    this.data = concepts.flatMap(c => {
      const activeConceptVersion = c.versions?.find(v => v.status === 'active');
      if (!activeConceptVersion) {
        return [];
      }
      const persistedVersionDesignations = activeConceptVersion.designations?.filter(d => designationsIds.includes(d.id!)) || [];

      if (persistedVersionDesignations.length > 0) {
        return persistedVersionDesignations.map(d => ({concept: c, designation: d}));
      }
      return [{concept: c}];
    });
  };

  public addRow(): void {
    this.data = [...this.data, {}];
  }
}
