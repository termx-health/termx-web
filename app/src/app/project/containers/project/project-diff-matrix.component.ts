import {Component, OnInit} from '@angular/core';
import {ProjectDiffItem, ProjectLibService} from 'lib/src/project';
import {combineLatest, takeUntil} from 'rxjs';
import {DestroyService, isDefined} from '@kodality-web/core-util';
import {ProjectContextComponent} from '../../../core/context/project-context.component';
import {Router} from '@angular/router';

@Component({
  templateUrl: './project-diff-matrix.component.html',
  providers: [DestroyService]
})
export class ProjectDiffMatrixComponent implements OnInit {
  public loading: boolean;
  public diffItems: ProjectDiffItem[];

  public constructor(
    public projectService: ProjectLibService,
    public router: Router,
    public ctx: ProjectContextComponent,
    private destroy$: DestroyService,
  ) {}

  public ngOnInit(): void {
    combineLatest([
      this.ctx.project$.pipe(takeUntil(this.destroy$)),
      this.ctx.pack$.pipe(takeUntil(this.destroy$)),
      this.ctx.version$.pipe(takeUntil(this.destroy$))
    ]).subscribe(([pr, p, v]) => {
      this.loading = true;
      this.projectService.diff({projectCode: pr?.code, packageCode: p?.code, version: v?.version}).subscribe(diff => {
        this.diffItems = diff.items;
      }).add(() => this.loading = false);
    });
  }

  public extractServers = (items: ProjectDiffItem[]): string[] => {
    return [...new Set(items.map(i => i.resourceServer).filter(s => isDefined(s)))];
  };


  public openDiff(item: ProjectDiffItem): void {
    this.router.navigate(['/projects/context', this.ctx.params, 'diff'], {queryParams: {resourceId: item.resourceId, resourceType: item.resourceType}});
  }
}
