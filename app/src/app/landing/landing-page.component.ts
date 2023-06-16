import {Component} from '@angular/core';
import {ComponentStateStore, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {catchError, forkJoin, Observable, of} from 'rxjs';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {AuthService} from '../core/auth';
import {CodeSystemLibService, MapSetLibService, ValueSetLibService} from 'term-web/resources/_lib';
import {SpaceService} from 'term-web/space/services/space.service';
import {TaskService} from 'term-web/taskflow/services/task-service';
import {Task, TaskflowLibModule} from 'term-web/taskflow/_lib';
import {PageService} from 'term-web/thesaurus/containers/page/services/page.service';

@Component({
  standalone: true,
  imports: [CoreUiModule, TaskflowLibModule],
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

  protected loader = new LoadingManager();


  public constructor(
    public authService: AuthService,
    private codeSystemService: CodeSystemLibService,
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService,
    private spaceService: SpaceService,
    private pageService: PageService,
    private taskService: TaskService,
    stateStore: ComponentStateStore,
  ) {
    stateStore.clear();
    this.loadResources();
    this.loadSummary();
    this.loadTasks();
  }


  private withPrivilege<T>(obs: Observable<T>, privilege: string): Observable<T> {
    const empty = of(SearchResult.empty()) as Observable<T>;

    return this.authService.hasPrivilege(privilege)
      ? obs.pipe(catchError(() => empty))
      : empty;
  }

  private loadResources(): void {
    const codeSystems$ = this.withPrivilege(this.codeSystemService.search({limit: 0}), '*.CodeSystem.view');
    const valueSets$ = this.withPrivilege(this.valueSetService.search({limit: 0}), '*.ValueSets.view');
    const mapSets$ = this.withPrivilege(this.mapSetService.search({limit: 0}), '*.MapSets.view');

    this.loader.wrap('resource', forkJoin([codeSystems$, valueSets$, mapSets$])).subscribe(([cs, vs, ms]) => {
      this.data.codeSystemCount = cs.meta.total;
      this.data.valueSetCount = vs.meta.total;
      this.data.mapSetsCount = ms.meta.total;
    });
  }

  private loadSummary(): void {
    const spaces$ = this.withPrivilege(this.spaceService.search({limit: 0}), '*.Space.view');
    const pages$ = this.withPrivilege(this.pageService.searchPages({limit: 0}), '*.Thesaurus.view');
    const tasksOpen$ = this.withPrivilege(this.taskService.search({limit: 0,statusesNe: 'cancelled,completed,error,rejected'}), '*.Task.view');

    this.loader.wrap('space', forkJoin([spaces$, pages$, tasksOpen$])).subscribe(([spaces, pages, tasks]) => {
      this.data.spacesCount = spaces.meta.total;
      this.data.pagesCount = pages.meta.total;
      this.data.tasksOpenCount = tasks.meta.total;
    });
  }

  private loadTasks(): void {
    const user = this.authService.user.username;

    const tasks$ = this.withPrivilege(this.taskService.search({limit: 0}), '*.Task.view');
    const tasksCreatedByUser$ = this.withPrivilege(this.taskService.search({createdBy: user}), '*.Task.view');
    const tasksAssignedToUser$ = this.withPrivilege(this.taskService.search({assignees: user}), '*.Task.view');

    this.loader.wrap('task', forkJoin([tasks$, tasksCreatedByUser$, tasksAssignedToUser$])).subscribe(([tasks, created, assigned]) => {
      this.data.tasksCount = tasks.meta.total;
      this.data.tasksCreated = created;
      this.data.tasksAssigned = assigned;
    });
  }


  protected taskRoute = (task: Task): any[] => {
    return this.authService.hasPrivilege('*.Task.edit') ? ['/taskflow', task.id, 'edit'] : [];
  };
}
