import {Component, OnDestroy, OnInit} from '@angular/core';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ComponentStateStore} from '@kodality-web/core-util';

@Component({
  templateUrl: './space-dashboard.component.html',
})
export class SpaceDashboardComponent implements OnInit, OnDestroy {
  protected readonly STORE_KEY = 'space-dashboard';

  protected selectedResourceType: 'code-system' | 'value-set' | 'map-set';

  public constructor(
    protected spaceContext: SpaceContextComponent,
    private stateStore: ComponentStateStore,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(p => {
      this.selectResourceType(p.get('resource') as any ?? 'code-system');
    });
  }

  public ngOnDestroy(): void {
    this.stateStore.put(this.STORE_KEY, {
      scrollY: window.scrollY,
      resourceType: this.selectedResourceType
    });
  }

  protected selectResourceType(type: 'code-system' | 'value-set' | 'map-set'): void {
    this.selectedResourceType = type;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {resource: type},
      queryParamsHandling: 'merge',
    });
  }

  protected openInTab(commands: any[]): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands));
    window.open(url).focus();
  }

  protected restoreScrollPosition(): void {
    setTimeout(() => {
      const state = this.stateStore.pop(this.STORE_KEY);
      if (state?.resourceType !== this.selectedResourceType) {
        return;
      }
      window.scrollTo({
        top: state?.scrollY,
        left: 0,
        behavior: 'smooth',
      });
    });
  }
}
