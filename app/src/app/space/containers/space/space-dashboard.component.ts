import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ComponentStateStore} from '@kodality-web/core-util';
import {EMPTY, Observable} from 'rxjs';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';

@Component({
  templateUrl: './space-dashboard.component.html',
})
export class SpaceDashboardComponent implements OnInit, OnDestroy {
  protected readonly STORE_KEY = 'space-dashboard';

  protected selectedResourceType: 'code-system' | 'value-set' | 'map-set';
  protected searchText: string;

  public constructor(
    protected spaceContext: SpaceContextComponent,
    private stateStore: ComponentStateStore,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(p => {
      this.searchText = p.get('text');
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
    this.mergeQueryParams({resource: type});
  }

  protected textSearch = (text: string): Observable<any> => {
    text ||= undefined;
    this.searchText = text;
    this.mergeQueryParams({text});
    return EMPTY;
  };


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


  private mergeQueryParams(queryParams: object): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
