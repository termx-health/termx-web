import {Component, OnInit} from '@angular/core';
import {CodeSystem} from 'terminology-lib/resources';
import {CodeSystemService} from '../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';


@Component({
  templateUrl: 'code-system-view.component.html',
  providers: [MuiDestroyService]
})
export class FinderCodeSystemViewComponent implements OnInit {
  public codeSystem?: CodeSystem;
  public loading = false;
  public narrativeVisible = false;


  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private destroy$: MuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.narrativeVisible = false;
      const id = params.get('id');

      if (isNil(id)) {
        this.codeSystem = undefined;
        return;
      }

      this.loading = true;
      forkJoin([
        this.codeSystemService.load(id),
        this.codeSystemService.loadVersions(id),
        this.codeSystemService.searchConcepts(id, {limit: -1}),
      ]).subscribe(([cs, versions, concepts]) => {
        this.codeSystem = cs;
        this.codeSystem.versions = versions;
        this.codeSystem.concepts = concepts.data;
      }).add(() => this.loading = false);
    });
  }
}
