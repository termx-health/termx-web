import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {Concept} from 'terminology-lib/concept/services/concept';
import {CodeSystemEntityVersion} from 'terminology-lib/codesystem/services/code-system-entity';

@Component({
  selector: 'twa-value-set-version-edit-concepts',
  templateUrl: './value-set-version-edit-concepts.component.html',
})
export class ValueSetVersionEditConceptsComponent implements OnChanges {
  public loading?: boolean;
  @Input() public valueSetId?: string;
  @Input() public versionVersion?: string;
  public concepts?: Concept[];

  public constructor(
    private valueSetService: ValueSetService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSetId"] || changes["versionVersion"]) {
      this.loadData();
    }
  }

  public loadData(): void {
    if (!this.valueSetId || !this.versionVersion) {
      return;
    }
    this.loading = true;
    this.valueSetService.loadConcepts(this.valueSetId, this.versionVersion)
      .subscribe(c => this.concepts = c)
      .add(() => this.loading = false);
  }

  public getDesignationName(versions: CodeSystemEntityVersion[]): string | undefined {
    return versions?.filter(v => v.status === 'active').flatMap(v => v.designations || []).find(d => d.preferred)?.name;
  }

  public addRow(): void {
    this.concepts = [...(this.concepts || []), new Concept()];
  }
}
