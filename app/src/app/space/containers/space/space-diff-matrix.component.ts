import {Component, OnInit} from '@angular/core';
import {SpaceDiffItem, SpaceLibService} from 'term-web/space/_lib';
import {combineLatest, takeUntil} from 'rxjs';
import {DestroyService, isDefined} from '@kodality-web/core-util';
import {Router} from '@angular/router';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';

@Component({
  templateUrl: './space-diff-matrix.component.html',
  providers: [DestroyService]
})
export class SpaceDiffMatrixComponent implements OnInit {
  public loading: boolean;
  public diffItems: SpaceDiffItem[];

  public constructor(
    public spaceService: SpaceLibService,
    public router: Router,
    public ctx: SpaceContextComponent,
    private destroy$: DestroyService,
  ) {}

  public ngOnInit(): void {
    combineLatest([
      this.ctx.space$.pipe(takeUntil(this.destroy$)),
      this.ctx.pack$.pipe(takeUntil(this.destroy$)),
      this.ctx.version$.pipe(takeUntil(this.destroy$))
    ]).subscribe(([s, p, v]) => {
      this.loading = true;
      this.spaceService.diff(s.id, p?.code, v?.version).subscribe(diff => {
        this.diffItems = diff.items;
      }).add(() => this.loading = false);
    });
  }

  public extractServers = (items: SpaceDiffItem[]): string[] => {
    return [...new Set(items.map(i => i.resourceServer).filter(s => isDefined(s)))];
  };


  public openDiff(item: SpaceDiffItem): void {
    this.router.navigate(['/spaces/context', this.ctx.params, 'diff'], {queryParams: {resourceId: item.resourceId, resourceType: item.resourceType}});
  }
}
