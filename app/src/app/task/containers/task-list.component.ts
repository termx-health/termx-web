import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, DestroyService, isDefined, LoadingManager, QueryParams, SearchResult, AutofocusDirective, ApplyPipe, IncludesPipe, LocalDatePipe } from '@termx-health/core-util';
import { CodeName, MarinaUtilModule } from '@termx-health/util';
import {Observable, tap} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {Task, TaskContextItem, TaskLibService, TaskSearchParams} from 'term-web/task/_lib';
import {User, UserLibService} from 'term-web/user/_lib';
import { TableComponent } from 'term-web/core/ui/components/table-container/table.component';

import { MuiInputModule, MuiButtonModule, MuiIconModule, MuiFormModule, MuiCoreModule, MuiSelectModule, MuiDatePickerModule, MuiBackendTableModule, MuiTableModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { TableFilterComponent } from 'term-web/core/ui/components/table-container/table-filter.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { TaskTypeComponent } from 'term-web/task/_lib/components/task-type.component';
import { TaskStatusComponent } from 'term-web/task/_lib/components/task-status.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

interface Filter {
  open: boolean,
  searchInput?: string,

  project?: string[],
  statusOption?: string,
  status?: string[],
  assignee?: string,
  priority?: string[],
  type?: string[],
  author?: string,
  createdFrom?: Date,
  createdTo?: Date,
  finishedFrom?: Date,
  finishedTo?: Date,
  unseenChanges?: boolean,
}

@Component({
    templateUrl: './task-list.component.html',
    providers: [DestroyService],
    imports: [TableComponent, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule, PrivilegedDirective, AddButtonComponent, RouterLink, MuiButtonModule, MuiIconModule, TableFilterComponent, MuiFormModule, MuiCoreModule, MuiSelectModule, ValueSetConceptSelectComponent, MuiDatePickerModule, MuiBackendTableModule, MuiTableModule, TaskTypeComponent, TaskStatusComponent, MuiNoDataModule, TranslatePipe, MarinaUtilModule, ApplyPipe, IncludesPipe, LocalDatePipe, HasAnyPrivilegePipe]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskLibService);
  private userService = inject(UserLibService);
  private stateStore = inject(ComponentStateStore);
  private auth = inject(AuthService);

  protected readonly STORE_KEY = 'task-list';

  protected query = new TaskSearchParams();
  protected searchResult: SearchResult<Task> = SearchResult.empty();
  protected filter: Filter = {open: false};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  protected loader = new LoadingManager();

  protected projects: CodeName[];
  protected users: User[];

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }
    this.loadData();
    this.loadProjects();
    this.loadUsers();
  }

  private loadUsers(): void {
    if (this.auth.hasPrivilege("*.Users.view")) {
      this.loader.wrap('user-list', this.userService.loadAll()).subscribe(users => this.users = users);
    }
  }

  private loadProjects(): void {
    this.loader.wrap('project-list', this.taskService.loadProjects()).subscribe(projects => this.projects = projects);
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }


  protected onDebounced = (): Observable<SearchResult<Task>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected onFilterOpen(): void {
    this.filter.open = true;
    this._filter = structuredClone(this.filter); // copy 'active' to 'temp'
  }

  protected onFilterSearch(): void {
    this.filter = {...structuredClone(this._filter)} as Filter; // copy 'temp' to 'active'
    this.query.offset = 0;
    this.loadData();
  }

  protected onFilterReset(): void {
    this.filter = {open: this.filter.open};
    this._filter = structuredClone(this.filter);
  }

  protected onFilterPresetSelect(preset: string): void {
    this.onFilterReset();
    if (preset === 'to-me') {
      this._filter.assignee = this.auth.user?.username;
    }
    if (preset === 'mine') {
      this._filter.author = this.auth.user?.username;
    }
  }

  private search(): Observable<SearchResult<Task>> {
    const q = copyDeep(this.query);
    q.textContains = this.filter?.searchInput;
    q.projectIds = this.filter.project?.join(',') || undefined;
    q.priorities = this.filter.priority?.join(',') || undefined;
    q.types = this.filter.type?.join(',') || undefined;
    q.createdGe = this.filter.createdFrom;
    q.createdLe = this.filter.createdTo;
    q.modifiedGe = this.filter.finishedFrom;
    q.modifiedLe = this.filter.finishedTo;
    q.assignees = this.filter.assignee;
    q.createdBy = this.filter.author;

    q.unseenChanges = this.filter.unseenChanges || undefined;

    this.processStatusOption(q, this.filter);
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    return this.loader.wrap('load', this.taskService.searchTasks(q));
  }


  // utils

  private processStatusOption(q: TaskSearchParams, filter: Filter): void {
    if (filter.statusOption === 'open') {
      q.statuses = 'draft,requested,received,accepted,ready,in-progress,on-hold,failed';
    }
    if (filter.statusOption === 'close') {
      q.statuses = 'completed,rejected,entered-in-error,cancelled';
    }
    if (filter.statusOption === 'is') {
      q.statuses = filter.status?.join(',');
    }
    if (filter.statusOption === 'is-not') {
      q.statusesNe = filter.status?.join(',');
    }
  }

  protected hasUnseenChanges = (task: Task): boolean => {
    return !task.lastOpenedTime || new Date(task.lastOpenedTime) < new Date(task.updatedAt);
  };

  private readonly contextTypeLabels: {[key: string]: string} = {
    'code-system': 'CS',
    'value-set': 'VS',
    'map-set': 'CM',
    'wiki': 'WS',
    'snomed-concept': 'SNOMED',
    'snomed-translation': 'SNOMED',
  };

  private readonly primaryContextTypes = new Set([
    'code-system', 'value-set', 'map-set', 'wiki', 'snomed-concept', 'snomed-translation'
  ]);

  protected contextDisplay = (ctx: Task['context']): TaskContextItem | undefined => {
    if (!ctx?.length) return undefined;
    return ctx.find(c => this.primaryContextTypes.has(c.type)) ?? ctx[0];
  };

  protected contextTypeLabel = (type: string): string => {
    return this.contextTypeLabels[type] ?? type;
  };

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]));
  }
}
