import {Component, OnInit} from '@angular/core';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';
import {ComponentStateStore} from '@kodality-web/core-util';

@Component({
  templateUrl: './space-dashboard.component.html',
})
export class SpaceDashboardComponent implements OnInit {
  protected readonly STORE_KEY = 'space-dashboard';

  public selectedResourceType: 'code-system' | 'value-set' | 'map-set';
  public constructor(public spaceContext: SpaceContextComponent, private stateStore: ComponentStateStore) {}

  public ngOnInit(): void {
    this.selectedResourceType = this.stateStore.pop(this.STORE_KEY) || 'code-system';

  }

  public selectResourceType(type: 'code-system' | 'value-set' | 'map-set'): void {
    this.selectedResourceType = type;
    this.stateStore.put(this.STORE_KEY, type);
  }
}
