import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {MapSet, MapSetVersion} from 'app/src/app/resources/_lib';
import {forkJoin} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';

@Component({
  templateUrl: 'map-set-summary.component.html'
})
export class MapSetSummaryComponent implements OnInit {
  protected mapSet?: MapSet;
  protected versions?: MapSetVersion[];
  protected showOnlyOpenedTasks?: boolean = true;
  protected loader = new LoadingManager();

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mapSetService: MapSetService
  ) {}

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
