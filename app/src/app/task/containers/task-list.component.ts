import {Component, OnInit} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, DestroyService, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {Task, TaskLibService, TaskSearchParams} from 'term-web/task/_lib';
import {AuthService} from 'term-web/core/auth';
import {CodeName} from '@kodality-web/marina-util';
import {User, UserLibService} from 'term-web/user/_lib';

@Component({
  templateUrl: './task-list.component.html',
  providers: [DestroyService]
})
export class TaskListComponent implements OnInit {
  protected query = new TaskSearchParams();
  protected searchResult: SearchResult<Task> = SearchResult.empty();
  protected searchInput: string;
  protected filterOpened: boolean;
  protected filter: {[key: string]: any} = {};
  protected loader = new LoadingManager();

  protected projects: CodeName[];
  protected users: User[];

  protected readonly STORE_KEY = 'task-list';

  public constructor(
    private taskService: TaskLibService,
    private userService: UserLibService,
    private stateStore: ComponentStateStore,
    private auth: AuthService,
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }
    this.loadData();
    this.loadProjects();
    this.loadUsers();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Task>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    q.projectIds = this.filter['project'] && this.filter['project']?.join(',') || undefined;
    q.priorities = this.filter['priority'] && this.filter['priority']?.join(',') || undefined;
    q.types = this.filter['type'] && this.filter['type']?.join(',') || undefined;
    q.createdGe = this.filter['created-from'];
    q.createdLe = this.filter['created-to'];
    q.modifiedGe = this.filter['finished-from'];
    q.modifiedLe = this.filter['finished-to'];
    q.assignees = this.filter['assignee'];
    q.createdBy = this.filter['author'];
    this.processStatusOption(q, this.filter);
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.taskService.searchTasks(q));
  }

  protected onSearch = (): Observable<SearchResult<Task>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected reset(): void {
    this.filter = {};
  }

  private loadProjects(): void {
    this.loader.wrap('project-list', this.taskService.loadProjects()).subscribe(projects => this.projects = projects);
  }

  private loadUsers(): void {
    this.loader.wrap('user-list', this.userService.loadAll()).subscribe(users => this.users = users);
  }

  private processStatusOption(q: TaskSearchParams, filter: any): void {
    if (filter['status-option'] === 'open') {
      q.statuses = 'draft,requested,received,accepted,ready,in-progress,on-hold,failed';
    }
    if (filter['status-option'] === 'close') {
      q.statuses = 'completed,rejected,entered-in-error,cancelled';
    }
    if (filter['status-option'] === 'is') {
      q.statuses = filter['status']?.join(',');
    }
    if (filter['status-option'] === 'is-not') {
      q.statusesNe = filter['status']?.join(',');
    }
  }

  protected searchFromPreset(preset: string): void {
    this.reset();
    if (preset === 'to-me') {
      this.filter['assignee'] = this.auth.user?.username;
    }
    if (preset === 'mine') {
      this.filter['author'] = this.auth.user?.username;
    }
  }

}