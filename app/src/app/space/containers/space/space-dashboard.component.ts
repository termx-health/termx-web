import {Component} from '@angular/core';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';

@Component({
  templateUrl: './space-dashboard.component.html',
})
export class SpaceDashboardComponent {
  public selectedResourceType: string = 'code-system';

  public constructor(public spaceContext: SpaceContextComponent) {}
}
