import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {ComponentStateStore} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {EMPTY, Observable} from 'rxjs';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';
import { MarinPageLayoutModule, MuiCardModule, MuiFormModule, MuiInputModule, MuiIconButtonModule, MuiListModule, MuiTooltipModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';

import { CodeSystemWidgetComponent } from 'term-web/resources/_lib/code-system/containers/code-system-widget.component';
import { ValueSetWidgetComponent } from 'term-web/resources/_lib/value-set/containers/value-set-widget.component';
import { MapSetWidgetComponent } from 'term-web/resources/_lib/map-set/containers/map-set-widget.component';
import { TranslatePipe } from '@ngx-translate/core';


type ResourceType = 'code-system' | 'value-set' | 'map-set' | 'structure-definition' | 'transformation-definition';

@Component({
    templateUrl: './space-dashboard.component.html',
    imports: [
    MarinPageLayoutModule,
    MuiCardModule,
    MuiFormModule,
    MuiInputModule,
    InputDebounceDirective,
    FormsModule,
    MuiIconButtonModule,
    MuiListModule,
    CodeSystemWidgetComponent,
    MuiTooltipModule,
    RouterLink,
    ValueSetWidgetComponent,
    MapSetWidgetComponent,
    TranslatePipe
],
})
export class SpaceDashboardComponent implements OnInit, OnDestroy {
  protected spaceContext = inject(SpaceContextComponent);
  private stateStore = inject(ComponentStateStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly STORE_KEY = 'space-dashboard';

  protected selectedResourceType: ResourceType;
  protected searchText: string;

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


  protected selectResourceType(type: ResourceType): void {
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
    window.open(window.location.origin + environment.baseHref + commands.join('/')).focus();
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
