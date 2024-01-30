import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BooleanInput, isDefined, LoadingManager} from '@kodality-web/core-util';
import {Task, TaskLibService} from 'term-web/task/_lib';
import {Router} from '@angular/router';
import {environment} from 'environments/environment';
import {ReleaseLibService} from 'term-web/sys/_lib';
import {map, Observable} from 'rxjs';
import {SnomedTranslationLibService} from 'term-web/integration/_lib';

@Component({
  selector: 'tw-resource-tasks-widget',
  templateUrl: 'resource-tasks-widget.component.html'
})
export class ResourceTasksWidgetComponent implements OnChanges {
  @Input() public resourceId: string;
  @Input() public taskFilters: {statuses?: string[]};
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'CodeSystemVersion' | 'ValueSetVersion' | 'MapSetVersion' | 'CodeSystemEntityVersion' |
    'Release' | 'SnomedConcept';
  @Input() public displayType: 'full' | 'content' = 'full';
  @Input() @BooleanInput() public openInNewTab: boolean | string = false;

  protected tasks: Task[];

  protected loader = new LoadingManager();

  private resourceTypeMap: {[key: string]: string} = {
    'CodeSystem': 'code-system',
    'ValueSet': 'value-set',
    'MapSet': 'map-set',
    'CodeSystemVersion': 'code-system-version',
    'ValueSetVersion': 'value-set-version',
    'MapSetVersion': 'map-set-version',
    'CodeSystemEntityVersion': 'concept-version'
  };

  public constructor(
    private taskLibService: TaskLibService,
    private router: Router,
    private snomedService: SnomedTranslationLibService,
    private releaseService: ReleaseLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceId'] || changes['resourceType']) && isDefined(this.resourceId) && isDefined(this.resourceType)) {
      this.loadTasks();
    }
  }

  protected openTask(number: string): void {
    if (this.openInNewTab) {
      window.open(window.location.origin + environment.baseHref + 'tasks/' + number + '/edit', '_blank');
    } else {
      this.router.navigate(['/tasks', number, 'edit']);
    }
  }

  protected filterTask = (task: Task, filters: {statuses: string[]}): boolean => {
    return (!filters?.statuses || filters.statuses.includes(task?.status));
  };

  public loadTasks(): void {
    if (this.resourceType === 'Release') {
      this.loader.wrap('load', this.releaseService.loadResources(Number(this.resourceId))).subscribe(resources => {
        this.tasks = [];
        resources.forEach(r => this.loader.wrap('load', this.loadResourceTasks(r.resourceId, this.resourceTypeMap[r.resourceType])).subscribe(t => this.tasks = [...this.tasks, ...t]));
      });
    }
    if (this.resourceType === 'SnomedConcept') {
      this.loader.wrap('load', this.snomedService.loadConceptTranslations(this.resourceId)).subscribe(translations => {
        this.tasks = [];
        this.loader.wrap('load', this.loadResourceTasks(this.resourceId, 'snomed-concept')).subscribe(t => this.tasks = [...this.tasks, ...t]);
        translations.forEach(t => this.loadResourceTasks(String(t.id), 'snomed-translation').subscribe(t => this.tasks = [...this.tasks, ...t]));
      });
    }
    this.loader.wrap('load', this.loadResourceTasks(this.resourceId, this.resourceTypeMap[this.resourceType])).subscribe(t => this.tasks = t);
  }

  private loadResourceTasks(id: string, type: string): Observable<Task[]> {
    return this.taskLibService.searchTasks({context: type + '|' + id, limit: 100}).pipe(map(tasks => tasks.data));
  }
}
