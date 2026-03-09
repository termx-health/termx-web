import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {MapSet, MapSetVersion} from 'term-web/resources/_lib';
import {forkJoin} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule, MuiCoreModule } from '@kodality-web/marina-ui';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { MapSetInfoWidgetComponent } from 'term-web/resources/map-set/containers/summary/widgets/map-set-info-widget.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { MapSetVersionsWidgetComponent } from 'term-web/resources/map-set/containers/summary/widgets/map-set-versions-widget.component';

import { ResourceTasksWidgetComponent as ResourceTasksWidgetComponent_1 } from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceRelatedArtifactWidgetComponent } from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import { ResourceTaskModalComponent } from 'term-web/resources/resource/components/resource-task-modal-component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'map-set-summary.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, MapSetInfoWidgetComponent, PrivilegedDirective, MuiButtonModule, RouterLink, MuiIconModule, MapSetVersionsWidgetComponent, MuiCoreModule, ResourceTasksWidgetComponent_1, ResourceRelatedArtifactWidgetComponent, ResourceTaskModalComponent, TranslatePipe]
})
export class MapSetSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mapSetService = inject(MapSetService);

  protected mapSet?: MapSet;
  protected versions?: MapSetVersion[];
  protected showOnlyOpenedTasks?: boolean = true;
  protected loader = new LoadingManager();

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(id);
  }

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.mapSetService.load(id), this.mapSetService.searchVersions(id, {limit: -1})]))
      .subscribe(([ms, versions]) => {
        this.mapSet = ms;
        this.versions = versions.data;
      });
  }
}
