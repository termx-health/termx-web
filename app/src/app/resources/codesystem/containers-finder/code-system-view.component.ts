import {Component, OnInit} from '@angular/core';
import {CodeSystem, CodeSystemConcept, CodeSystemVersion} from 'terminology-lib/resources';
import {CodeSystemService} from '../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, takeUntil} from 'rxjs';
import {DestroyService, isNil, SearchResult} from '@kodality-web/core-util';


@Component({
  templateUrl: 'code-system-view.component.html',
  providers: [DestroyService]
})
export class FinderCodeSystemViewComponent implements OnInit {
  public readonly DEFAULT_CONCEPT_LIMIT = 100;

  public codeSystem?: CodeSystem;
  public versions: CodeSystemVersion[] = [];
  public conceptResult: SearchResult<CodeSystemConcept> = SearchResult.empty();

  private loading: {[k: string]: boolean} = {};
  public narrativeVisible = false;


  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}


  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.narrativeVisible = false;
      const id = params.get('id');

      if (isNil(id)) {
        this.codeSystem = undefined;
        return;
      }

      this.loading['general'] = true;
      forkJoin([
        this.codeSystemService.load(id),
        this.codeSystemService.searchVersions(id, {limit: -1})
      ]).subscribe(([cs, versions]) => {
        this.codeSystem = cs;
        this.versions = versions.data;
      }).add(() => this.loading['general'] = false);

      this.loadConcepts(id);
    });
  }


  public loadConcepts(id: string, limit: number = this.DEFAULT_CONCEPT_LIMIT): void {
    this.loading['concepts'] = true;
    this.codeSystemService.searchConcepts(id, {limit: limit})
      .subscribe(concepts => this.conceptResult = concepts)
      .add(() => this.loading['concepts'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
