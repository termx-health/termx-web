import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isNil, SearchResult} from '@kodality-web/core-util';
import {forkJoin, takeUntil} from 'rxjs';
import {CodeSystem, CodeSystemConcept, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent } from 'term-web/core/components/finder/finder.component';
import { MuiFormModule, MuiButtonModule } from '@kodality-web/marina-ui';

import { MarinaQuillModule } from '@kodality-web/marina-quill';
import { FormsModule } from '@angular/forms';
import { MarinaUtilModule } from '@kodality-web/marina-util';


@Component({
    templateUrl: 'code-system-view.component.html',
    providers: [DestroyService],
    imports: [FinderWrapperComponent, MuiFormModule, MarinaQuillModule, FormsModule, MuiButtonModule, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent, MarinaUtilModule]
})
export class FinderCodeSystemViewComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public readonly DEFAULT_CONCEPT_LIMIT = 100;

  public codeSystem?: CodeSystem;
  public versions: CodeSystemVersion[] = [];
  public conceptResult: SearchResult<CodeSystemConcept> = SearchResult.empty();

  public loading: {[k: string]: boolean} = {};
  public narrativeVisible = false;


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
}
