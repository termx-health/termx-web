import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetService} from '../../services/value-set.service';
import {CodeSystemEntityVersion, Concept} from 'terminology-lib/resources';

@Component({
  selector: 'twa-value-set-version-concepts-list',
  templateUrl: 'value-set-version-concepts-list.component.html',
})
export class ValueSetVersionConceptsListComponent implements OnChanges {
  @Input() public valueSetId?: string;
  @Input() public valueSetVersion?: string;

  public concepts: Concept[] = [];
  public loading = false;

  public constructor(private valueSetService: ValueSetService,) { }

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
    this.valueSetService.loadConcepts(this.valueSetId, this.valueSetVersion)
      .subscribe(c => this.concepts = c)
      .add(() => this.loading = false);
  }

  public addRow(): void {
    this.concepts = [...this.concepts, new Concept()];
  }

  public getDesignationName(versions: CodeSystemEntityVersion[]): string | undefined {
    return versions?.filter(v => v.status === 'active').flatMap(v => v.designations || []).find(d => d.preferred)?.name;
  }
}
