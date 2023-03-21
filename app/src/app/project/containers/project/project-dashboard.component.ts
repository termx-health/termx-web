import {Component} from '@angular/core';
import {ProjectContextComponent} from 'term-web/core/context/project-context.component';

@Component({
  templateUrl: './project-dashboard.component.html',
})
export class ProjectDashboardComponent {
  public selectedResourceType: string = 'code-system';

  public constructor(public projectContext: ProjectContextComponent) {}
}
