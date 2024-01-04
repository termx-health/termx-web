import {Component, OnInit} from '@angular/core';
import {SpaceDiffItem, SpaceLibService} from 'term-web/space/_lib';
import {combineLatest, takeUntil} from 'rxjs';
import {DestroyService, isDefined} from '@kodality-web/core-util';
import {Router} from '@angular/router';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {PackageResourceService} from 'term-web/space/services/package-resource.service';
import {SpaceService} from 'term-web/space/services/space.service';

@Component({
  templateUrl: './space-diff-matrix.component.html',
  providers: [DestroyService]
})
export class SpaceDiffMatrixComponent implements OnInit {
  public loading: boolean;
  public allChecked: boolean;
  public diffItems: SpaceDiffItem[];

  public constructor(
    public spaceService: SpaceService,
    public packageResourceService: PackageResourceService,
    public notificationService: MuiNotificationService,
    public router: Router,
    public ctx: SpaceContextComponent,
    private destroy$: DestroyService,
  ) {}

  public ngOnInit(): void {
    this.loadDiff();
  }

  public extractServers = (items: SpaceDiffItem[]): string[] => {
    return [...new Set(items.map(i => i.resourceServer).filter(s => isDefined(s)))];
  };


  public openDiff(item: SpaceDiffItem): void {
    this.router.navigate(['/spaces/context', this.ctx.params, 'diff'], {queryParams: {resourceId: item.resourceId, resourceType: item.resourceType}});
  }

  protected loadDiff(clearCache?: boolean): void {
    combineLatest([
      this.ctx.space$.pipe(takeUntil(this.destroy$)),
      this.ctx.pack$.pipe(takeUntil(this.destroy$)),
      this.ctx.version$.pipe(takeUntil(this.destroy$))
    ]).subscribe(([s, p, v]) => {
      this.loading = true;
      this.spaceService.diff(s.id, p?.code, v?.version, this.destroy$, clearCache).subscribe(diff => {
        this.diffItems = diff.items;
        if (isDefined(diff.error)) {
          this.notificationService.error('Diff error', diff.error);
        }
      }).add(() => this.loading = false);
    });
  }

  protected sync(): void {
    combineLatest([
      this.ctx.space$.pipe(takeUntil(this.destroy$)),
      this.ctx.pack$.pipe(takeUntil(this.destroy$)),
      this.ctx.version$.pipe(takeUntil(this.destroy$))
    ]).subscribe(([s, p, v]) => {
      this.loading = true;
      this.spaceService.sync(s.id, p?.code, v?.version, this.destroy$).subscribe(jobLog => {
        if (isDefined(jobLog.errors)) {
          jobLog.errors.forEach(err =>  this.notificationService.error('Sync error', err));
        }
        this.loadDiff(true);
      }).add(() => this.loading = false);
    });
  }

  protected checkAllItems(checked: boolean): void {
    this.diffItems?.forEach(i => i['_checked'] = checked);
  }

  protected changeSourceServer(server: string): void {
    const ids = this.diffItems.filter(i => !!i['_checked']).map(i => i.id);
    this.packageResourceService.changeServer(ids, server).subscribe(() => this.loadDiff(true));
  }
}
