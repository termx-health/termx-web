import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {Task, TaskActivity, TaskContextItem, Workflow} from 'term-web/task/_lib';
import {forkJoin} from 'rxjs';
import {TaskService} from 'term-web/task/services/task-service';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';
import {CodeName} from '@kodality-web/marina-util';
import {User, UserLibService} from 'term-web/user/_lib';
import {CodeSystemVersionLibService} from 'term-web/resources/_lib/codesystem/services/code-system-version-lib.service';
import {CodeSystemEntityVersionLibService, ValueSetVersionLibService} from 'term-web/resources/_lib';

@Component({
  templateUrl: './task-edit.component.html',
})
export class TaskEditComponent implements OnInit {
  protected task?: Task;
  protected newStatus?: string;
  protected newActivity?: {visible?: boolean, note?: string} = {};
  protected loader = new LoadingManager();
  protected mode: string;

  protected users: User[];
  protected projects: CodeName[];
  protected workflows: Workflow[];

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private taskService: TaskService,
    private userService: UserLibService,
    private route: ActivatedRoute,
    private router: Router,
    private snomedTranslationService: SnomedTranslationService,
    private codeSystemVersionService: CodeSystemVersionLibService,
    private codeSystemEntityVersionService: CodeSystemEntityVersionLibService,
    private valueSetVersionService: ValueSetVersionLibService,
  ) { }

  public ngOnInit(): void {
    const number = this.route.snapshot.paramMap.get('number');
    this.mode = number ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadTask(number);
    } else {
      this.task = this.writeTask(new Task());
    }

    this.loadData();
  }

  private loadTask(number: string): void {
    this.loader.wrap('load', this.taskService.loadTask(number))
      .subscribe(task => {
        this.task = task;
        this.loadWorkflows(task.project.code);
      });
  }

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    if (!this.task.status && !this.newStatus) {
      return;
    }
    const t = copyDeep(this.task);
    t.status = this.newStatus || t.status;
    this.loader.wrap('save', this.taskService.save(t)).subscribe(t => {
      this.router.navigate(['/tasks/', t.number, 'edit'], {replaceUrl: true});
      this.loadTask(t.number);
    });
  }

  protected createActivity(): void {
    const number = this.task.number;
    const note = this.newActivity.note;
    if (!isDefined(number) || !isDefined(note)) {
      return;
    }
    this.loader.wrap('save', this.taskService.createActivity(number, note)).subscribe(() => {
      this.loadTask(this.task.number);
      this.newActivity = {};
    });
  }

  protected updateActivity(id: string, note: string): void {
    const number = this.task.number;
    if (!isDefined(number) || !isDefined(id) || !isDefined(note)) {
      return;
    }
    this.loader.wrap('save', this.taskService.updateActivity(number, id, note)).subscribe(() => {
      this.loadTask(this.task.number);
      this.newActivity = {};
    });
  }

  protected deleteActivity(id: string): void {
    const number = this.task.number;
    this.loader.wrap('delete-activity', this.taskService.deleteActivity(number, id))
      .subscribe(() => this.loadTask(this.task.number));
  }

  protected loadWorkflows(projectCode: string): void {
    if (!projectCode) {
      return;
    }
    this.taskService.loadProjectWorkflows(projectCode).subscribe(workflows => this.workflows = workflows);
  }

  protected getTargetStatuses = (wfCode: string, status: string, workflows: Workflow[]): string[] => {
    const wf = workflows?.find(w => w.code === wfCode);
    if (!isDefined(wf)) {
      return [];
    }
    const statuses = wf.transitions?.filter(t => t.from === status)?.map(t => t.to);
    if (statuses?.includes('draft')) {
      this.newStatus = 'draft';
    }
    return statuses;
  };

  protected hasTransitions = (activities: TaskActivity[]): TaskActivity[] => {
    if (!isDefined(activities)) {
      return [];
    }
    return activities.filter(a => a.note || (this.changeTransitions(a.transition)?.length > 0));
  };

  protected changeTransitions = (transition: {[key: string]: {from?: string, to?: string}}): {key: string, transition: {from?: string, to?: string}}[] => {
    if (!isDefined(transition)) {
      return [];
    }
    return Object.keys(transition)
      .filter(t => !['updated_at'].includes(t))
      .filter(t => isDefined(transition[t].from))
      .map(t => ({key: t, transition: transition[t]}));
  };

  protected openContext(ctx: TaskContextItem): void {
    if (ctx.type === 'snomed-translation') {
      this.snomedTranslationService.load(ctx.id).subscribe(t => this.router.navigate(['/integration/snomed/dashboard', t.conceptId]));
    }
    if (ctx.type === 'code-system') {
      this.router.navigate(['/resources/code-systems', ctx.id, 'summary']);
    }
    if (ctx.type === 'code-system-version') {
      this.codeSystemVersionService.load(ctx.id).subscribe(version => {
        this.router.navigate(['/resources/code-systems', version.codeSystem, 'versions', version.version, 'summary']);
      });
    }
    if (ctx.type === 'code-system-entity-version') {
      this.codeSystemEntityVersionService.load(ctx.id).subscribe(version => {
        this.router.navigate(['/resources/code-systems', version.codeSystem, 'concepts', version.code, 'view'], {queryParams: {conceptVersionId: version.id}});
      });
    }
    if (ctx.type === 'value-set') {
      this.router.navigate(['/resources/value-sets', ctx.id, 'summary']);
    }
    if (ctx.type === 'value-set-version') {
      this.valueSetVersionService.load(ctx.id).subscribe(version => {
        this.router.navigate(['/resources/value-sets', version.valueSet, 'versions', version.version, 'summary']);
      });
    }
  }

  private loadData(): void {
    this.loader.wrap('load', forkJoin([
      this.userService.loadAll(),
      this.taskService.loadProjects()
    ])).subscribe(([users, projects]) => {
      this.users = users;
      this.projects = projects;
    });
  }

  private writeTask(task: Task): Task {
    task.type ??= 'task';
    task.status ??= 'requested';
    task.priority ??= 'routine';
    task.project ??= {};
    return task;
  }
}
