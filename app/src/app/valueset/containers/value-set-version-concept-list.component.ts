import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {ActivatedRoute} from '@angular/router';
import {Concept} from 'terminology-lib/codesystem/services/concept';
import {CodeSystemEntityVersion} from 'terminology-lib/codesystem/services/code-system-entity';

@Component({
  selector: 'twa-value-set-version-concept-list',
  templateUrl: './value-set-version-concept-list.component.html',
})
export class ValueSetVersionConceptListComponent implements OnInit {
  public loading?: boolean;
  public valueSetId?: string;
  public verisonVersion?: string;
  public concepts?: Concept[];


  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id') || undefined;
    this.verisonVersion = this.route.snapshot.paramMap.get('versionId') || undefined;
    this.loadData();
  }

  public loadData(): void {
    if (!this.valueSetId || !this.verisonVersion) {
      return;
    }
    this.loading = true;
    this.valueSetService.loadConcepts(this.valueSetId, this.verisonVersion).subscribe(c => {
      this.concepts = c;
    }).add(() => this.loading = false);
  }

  public getDesignationName(versions: CodeSystemEntityVersion[]): string | undefined {
    console.log(versions);
    for (let version of versions) {
      if (version.status === 'active' && version.designations) {
        for (let designation of version.designations) {
          if (designation.preferred) {
            return designation.name;
          }
        }
      }
    }
  }
}
