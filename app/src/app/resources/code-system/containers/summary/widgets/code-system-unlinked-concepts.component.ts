import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BooleanInput, copyDeep, isDefined, LoadingManager, SearchResult, validateForm, ApplyPipe, FilterPipe, LocalDatePipe } from '@termx-health/core-util';
import {debounceTime, distinctUntilChanged, map, Observable, Subject, switchMap} from 'rxjs';
import {CodeSystemEntityVersion, CodeSystemEntityVersionSearchParams, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {Task} from 'term-web/task/_lib';
import {TaskService} from 'term-web/task/services/task-service';

import { MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCheckboxModule, MuiCoreModule, MuiDropdownModule, MuiNoDataModule, MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiSelectModule, MuiButtonModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { UserSelectComponent } from 'term-web/user/_lib/components/user-select.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    selector: 'tw-code-system-unlinked-concepts',
    templateUrl: 'code-system-unlinked-concepts.component.html',
    imports: [MuiInputModule, FormsModule, MuiBackendTableModule, MuiTableModule, MuiCheckboxModule, MuiCoreModule, RouterLink, StatusTagComponent, MuiDropdownModule, MuiNoDataModule, MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiSelectModule, UserSelectComponent, MuiButtonModule, TranslatePipe, ApplyPipe, FilterPipe, LocalDatePipe, HasAnyPrivilegePipe]
})
export class CodeSystemUnlinkedConceptsComponent implements OnInit, OnChanges {
  private codeSystemService = inject(CodeSystemService);
  private taskService = inject(TaskService);
  private router = inject(Router);

  @Input() public codeSystem: string;
  @Input() public approvalRequired: boolean;
  @Input() public versions: CodeSystemVersion[];
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Output() public taskCreated = new EventEmitter<void>();

  public query = new CodeSystemEntityVersionSearchParams();
  protected searchInput?: string;
  protected searchUpdate = new Subject<string>();
  protected searchResult: SearchResult<CodeSystemEntityVersion> = SearchResult.empty();

  protected tasks: Task[];
  protected taskModalData: {visible?: boolean, assignee?: string, codeSystemVersionId?: number, entityVersionId?: number} = {};
  @ViewChild("taskModalForm") public taskModalForm?: NgForm;

  protected loader = new LoadingManager();

  public ngOnInit(): void {
    this.loadUnlinkedConcepts();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystem'] && this.codeSystem) {
      this.loadUnlinkedConcepts();
    }
  }

  public loadUnlinkedConcepts(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<CodeSystemEntityVersion>> {
    const q = copyDeep(this.query);
    q.codeSystem = this.codeSystem;
    q.textContains = this.searchInput || undefined;
    q.status = 'draft,active';
    q.unlinked = true;
    return this.loader.wrap('load', this.codeSystemService.searchEntityVersions(this.codeSystem, q).pipe(map(resp => {
      this.loadTasks(resp.data.map(d => d.id));
      return resp;
    })));
  }

  protected link(codeSystemVersion: string, entityVersionId): void {
    this.loader.wrap('link',this.codeSystemService.linkEntityVersions(this.codeSystem, codeSystemVersion, [entityVersionId]))
      .subscribe(() => this.loadUnlinkedConcepts());
  }

  public checked = (): number[] => {
    return this.searchResult.data?.filter(c => c['checked']).map(c => c.id);
  };

  protected filterDraftVersions = (v: CodeSystemVersion): boolean => {
    return v.status === 'draft';
  };

  public openConcept(entityVersion: CodeSystemEntityVersion): void {
    const mode = this.viewMode ? '/view' : '/edit';
    const path = `/resources/code-systems/${this.codeSystem}/concepts/${entityVersion.code}${mode}`;
    this.router.navigate([path], {queryParams: {conceptVersionId: entityVersion.id}});
  }

  private loadTasks(ids: number[]): void {
    if (!ids || ids.length < 1) {
      return;
    }
    this.loader.wrap('load-tasks', this.taskService.searchTasks({context: ids.map(id => 'concept-version|' + id).join(','), limit: -1}))
      .subscribe(tasks => this.tasks = tasks.data);
  }

  protected findTask = (tasks: Task[], id: number): Task => {
    return tasks?.find(t => t.status === 'requested' && isDefined(t.context?.find(c => c.id === id)));
  };

  protected createTask(): void {
    if (!validateForm(this.taskModalForm)) {
      return;
    }

    const task = new Task();
    task.workflow = 'concept-approval';
    task.assignee = this.taskModalData.assignee;
    task.title = 'Approve code system "' + this.codeSystem + '" concepts';
    task.context = [{type: 'code-system', id: this.codeSystem}, {type: 'concept-version', id: this.taskModalData.entityVersionId}];
    if (this.taskModalData.codeSystemVersionId) {
      task.content = "On task approve linkage with code system version will be created";
      task.context.push({type: 'code-system-version', id: this.taskModalData.codeSystemVersionId});
    }
    this.loader.wrap('create-task', this.taskService.save(task)).subscribe(() => {
      this.taskModalData = {};
      this.loadTasks(this.searchResult.data?.map(d => d.id));
      this.taskCreated.emit();
    });
  }
}
