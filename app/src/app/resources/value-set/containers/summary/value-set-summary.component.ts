import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {ValueSet, ValueSetSnapshot, ValueSetVersion} from 'app/src/app/resources/_lib';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {forkJoin} from 'rxjs';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';

@Component({
  templateUrl: 'value-set-summary.component.html'
})
export class ValueSetSummaryComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected versions?: ValueSetVersion[];
  protected loader = new LoadingManager();
  protected showOnlyOpenedTasks?: boolean = true;

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valueSetService: ValueSetService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(id);
  }

  protected mapVersionToSnapshot = (versions: ValueSetVersion[]): ValueSetSnapshot[] => {
    return versions?.map(v => v.snapshot).filter(s => isDefined(s));
  };

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet.id, 'versions', version, 'summary']);
  }

  public openVersionConcepts(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet.id, 'versions', version, 'concepts']);
  }

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.valueSetService.load(id), this.valueSetService.searchVersions(id, {decorated: true, limit: -1})]))
      .subscribe(([vs, versions]) => {
        this.valueSet = vs;
        this.versions = versions.data;
      });
  }
}
