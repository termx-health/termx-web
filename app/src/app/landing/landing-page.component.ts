import {Component} from '@angular/core';
import {ComponentStateStore, duplicate, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {catchError, forkJoin, Observable, of} from 'rxjs';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {AuthService} from '../core/auth';
import {CodeSystemLibService, MapSetLibService, ValueSetLibService} from 'term-web/resources/_lib';
import {SpaceService} from 'term-web/space/services/space.service';
import {TaskService} from 'term-web/task/services/task-service';
import {Task, TaskLibModule} from 'term-web/task/_lib';
import {PageLibService, WikiLibModule} from 'term-web/wiki/_lib';
import {SpaceModule} from 'term-web/space/space.module';
import {InfoService} from 'term-web/core/info/info.service';

type Modules = 'terminology' | 'core' | 'task' | 'wiki';

@Component({
  standalone: true,
  imports: [CoreUiModule, TaskLibModule, WikiLibModule, SpaceModule],
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.less']
})
export class LandingPageComponent {
  protected data: {
    codeSystemCount?: number,
    valueSetCount?: number,
    mapSetsCount?: number,

    spacesCount?: number,
    pagesCount?: number,
    tasksOpenCount?: number,

    tasksCount?: number,
    tasksCreated?: SearchResult<Task>
    tasksAssigned?: SearchResult<Task>
  } = {};

  protected modules: Modules[] = [];
  protected loader = new LoadingManager<'info' | 'resources' | 'summary' | 'task'>();


  public constructor(
    public authService: AuthService,
    private codeSystemService: CodeSystemLibService,
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService,
    private spaceService: SpaceService,
    private pageService: PageLibService,
    private taskService: TaskService,
    stateStore: ComponentStateStore,
    info: InfoService,
  ) {
    stateStore.clear();
    this.loader.wrap('info', info.modules()).subscribe(resp => {
      this.modules = resp as Modules[];

      this.loadResources();
      this.loadSummary();
      this.loadTasks();
    });
  }


  private withPrivilege<T>(obs: Observable<T>, privilege: string, module: Modules): Observable<T> {
    const empty = of(SearchResult.empty()) as Observable<T>;

    return this.authService.hasPrivilege(privilege) && this.modules.includes(module)
      ? obs.pipe(catchError(() => empty))
      : empty;
  }

  private loadResources(): void {
    const codeSystems$ = this.codeSystemService.search({limit: 0});
    const valueSets$ = this.valueSetService.search({limit: 0});
    const mapSets$ = this.mapSetService.search({limit: 0});

    this.loader.wrap('resources', forkJoin([
      this.withPrivilege(codeSystems$, "*.CodeSystem.view", 'terminology'),
      this.withPrivilege(valueSets$, "*.ValueSet.view", 'terminology'),
      this.withPrivilege(mapSets$, "*.MapSet.view", 'terminology'),
    ])).subscribe(([cs, vs, ms]) => {
      this.data.codeSystemCount = cs.meta.total;
      this.data.valueSetCount = vs.meta.total;
      this.data.mapSetsCount = ms.meta.total;
    });
  }

  private loadSummary(): void {
    const spaces$ = this.spaceService.search({limit: 0});
    const pages$ = this.pageService.searchPages({limit: 0});
    const tasksOpen$ = this.taskService.searchTasks({limit: 0, statusesNe: 'cancelled,completed,error,rejected'});

    this.loader.wrap('summary', forkJoin([
      this.withPrivilege(spaces$, '*.Space.view', 'core'),
      this.withPrivilege(pages$, '*.Wiki.view', 'wiki'),
      this.withPrivilege(tasksOpen$, '*.Task.view', 'task')
    ])).subscribe(([spaces, pages, tasks]) => {
      this.data.spacesCount = spaces.meta.total;
      this.data.pagesCount = pages.meta.total;
      this.data.tasksOpenCount = tasks.meta.total;
    });
  }

  private loadTasks(): void {
    const user = this.authService.user?.username;

    const tasks$ = this.taskService.searchTasks({limit: 0});
    const tasksCreatedByUser$ = this.taskService.searchTasks({createdBy: user});
    const tasksAssignedToUser$ = this.taskService.searchTasks({assignees: user});

    this.loader.wrap('task', forkJoin([
      this.withPrivilege(tasks$, '*.Task.view', 'task'),
      this.withPrivilege(tasksCreatedByUser$, '*.Task.view', 'task'),
      this.withPrivilege(tasksAssignedToUser$, '*.Task.view', 'task'),
    ])).subscribe(([tasks, created, assigned]) => {
      this.data.tasksCount = tasks.meta.total;
      this.data.tasksCreated = created;
      this.data.tasksAssigned = assigned;
    });
  }


  protected taskRoute = (task: Task): any[] => {
    return this.authService.hasPrivilege('*.Task.edit') ? ['/tasks', task.number, 'edit'] : [];
  };

  protected intersects(arr1: Modules[], arr2: Modules[]): boolean {
    return [...arr1, ...arr2].filter(duplicate)?.length > 0;
  }
}
