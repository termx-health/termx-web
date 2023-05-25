import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {
  Space, SpaceLibService,
  Task,
  TaskActivity,
  TaskActivityTransition,
  TaskContextItem,
  TaskflowUser, UserLibService,
  Workflow,
  WorkflowLibService
} from 'term-web/taskflow/_lib';
import {forkJoin} from 'rxjs';
import {TaskService} from 'term-web/taskflow/services/task-service';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';

@Component({
  templateUrl: './task-edit.component.html',
})
export class TaskEditComponent implements OnInit {
  protected task?: Task;
  protected taskActivities?: TaskActivity[];
  protected newStatus?: string;
  protected newActivity?: {visible?: boolean, note?: string} = {};
  protected loader = new LoadingManager();
  protected mode: string;

  protected users: TaskflowUser[];
  protected spaces: Space[];
  protected workflows: Workflow[];

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private taskService: TaskService,
    private workflowService: WorkflowLibService,
    private spaceService: SpaceLibService,
    private userService: UserLibService,
    private route: ActivatedRoute,
    private router: Router,
    private snomedTranslationService: SnomedTranslationService,
  ) { }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = id ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadTask(Number(id));
    } else {
      this.task = this.writeTask(new Task());
    }

    this.loadData();
  }

  private loadTask(id: number): void {
    this.loader.wrap('load', forkJoin([
      this.taskService.load(id),
      this.taskService.loadActivities(id)]))
      .subscribe(([task, activities]) => {
        this.task = this.prepare(task);
        this.taskActivities = activities;
        this.loadWorkflows(task.spaceId);
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
    t.assignee = t.assignee.sub ? t.assignee : undefined;
    this.loader.wrap('save', this.taskService.save(t)).subscribe(t => {
      this.router.navigate(['/taskflow/', t.id, 'edit'], {replaceUrl: true});
      this.loadTask(t.id);
    });
  }

  protected createActivity(): void {
    const id = this.task.id;
    const note = this.newActivity.note;
    if (!isDefined(id) || !isDefined(note)) {
      return;
    }
    this.loader.wrap('save', this.taskService.createActivity(id, note)).subscribe(() => {
      this.loadTask(this.task.id);
      this.newActivity = {};
    });
  }

  protected loadWorkflows(spaceId: number): void {
    if (!spaceId) {
      return;
    }
    this.workflowService.search({spaceIds: String(spaceId), limit: -1}).subscribe(w => this.workflows = w.data);
  }

  protected getTargetStatuses = (wfId: number, status: string, workflows: Workflow[]): string[] => {
    const wf = workflows?.find(w => w.id === wfId);
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

  protected changeTransitions = (transition: {[key: string]: TaskActivityTransition}): {key: string, transition: TaskActivityTransition}[] => {
    if (!isDefined(transition)) {
      return [];
    }
    return Object.keys(transition)
      .filter(t => !['updated_at'].includes(t))
      .filter(t => isDefined(transition[t].from))
      .map(t => ({key: t, transition: transition[t]}));
  };

  private prepare(task: Task): Task {
    task.assignee ??= new TaskflowUser();
    return task;
  }

  protected openContext(ctx: TaskContextItem): void {
    if (ctx.type === 'snomed-translation') {
      this.snomedTranslationService.load(ctx.id).subscribe(t => this.router.navigate(['/integration/snomed', t.conceptId]));
    }
  }

  private loadData(): void {
    this.loader.wrap('load', forkJoin([
      this.userService.load(),
      this.spaceService.loadAll()
    ])).subscribe(([users, spaces]) => {
      this.users = users;
      this.spaces = spaces;
    });
  }

  private writeTask(task: Task): Task {
    task.type ??= 'task';
    task.priority ??= 'routine';
    task.assignee ??= {};
    return task;
  }
}
