import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {ActivatedRoute} from '@angular/router';
import {Concept} from 'terminology-lib/codesystem/services/concept';
import {CodeSystemEntityVersion} from 'terminology-lib/codesystem/services/code-system-entity';
import {ConceptService} from '../../concept/services/concept.service';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {ConceptSearchParams} from 'terminology-lib/concept/services/concept-search-params';
import {Designation} from 'terminology-lib/codesystem/services/designation';
import {DesignationService} from '../../designation/services/designation.service';
import {DesignationSearchParams} from 'terminology-lib/designation/services/designation-search-params';

@Component({
  selector: 'twa-value-set-version-concept-list',
  templateUrl: './value-set-version-concept-list.component.html',
})
export class ValueSetVersionConceptListComponent implements OnInit {
  public loading?: boolean;
  public valueSetId?: string;
  public verisonVersion?: string;
  public concepts?: Concept[];
  public conceptSearchResult: SearchResult<Concept> = new SearchResult<Concept>();
  public designationSearchResult: SearchResult<Designation> = new SearchResult<Designation>();
  public searchLoading?: boolean;
  public conceptQuery: ConceptSearchParams = new ConceptSearchParams();
  public designationQuery: DesignationSearchParams = new DesignationSearchParams();


  public constructor(
    private valueSetService: ValueSetService,
    private conceptService: ConceptService,
    private designationService: DesignationService,
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
    if (versions) {
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
    return "fix me";
  }

  public newConceptRow(): void {
    this.concepts = [...(this.concepts || []), new Concept()];
    return;
  }

  public searchConcepts(input: string): void {
    if (input.length > 0) {
      this.searchLoading = true;
      const q = copyDeep(this.conceptQuery);
      q.codeContains = input;
      this.conceptService.search(q).subscribe(c => this.conceptSearchResult = c)
        .add(() => this.searchLoading = false);
    }
  }

  public searchDesignations(input: string): void {
    if (input.length > 0) {
      this.searchLoading = true;
      const q = copyDeep(this.designationQuery);
      q.conceptCode = input;
      this.designationService.search(q).subscribe(c => this.designationSearchResult = c)
        .add(() => this.searchLoading = false);
    }
  }

}
