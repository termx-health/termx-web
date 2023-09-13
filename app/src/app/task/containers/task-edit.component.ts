import {Component, Injectable, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, isNil, LoadingManager, validateForm} from '@kodality-web/core-util';
import {Task, TaskActivity, TaskContextItem, Workflow} from 'term-web/task/_lib';
import {forkJoin, map, mergeMap} from 'rxjs';
import {TaskService} from 'term-web/task/services/task-service';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';
import {CodeName} from '@kodality-web/marina-util';
import {User, UserLibService} from 'term-web/user/_lib';
import {CodeSystemVersionLibService} from 'term-web/resources/_lib/codesystem/services/code-system-version-lib.service';
import {CodeSystemEntityVersionLibService, MapSetVersionLibService, ValueSetVersionLibService} from 'term-web/resources/_lib';
import {AuthService} from 'term-web/core/auth';
import {PageCommentLibService, PageLibService} from 'term-web/wiki/_lib';

@Injectable({providedIn: 'root'})
class TaskContextLinkService {
  private handlers = {
    'snomed-translation': (ctx: TaskContextItem): void => {
      this.snomedTranslationService.load(ctx.id).subscribe(t => {
        this.router.navigate(['/integration/snomed/dashboard', t.conceptId]);
      });
    },

    // Code System
    'code-system': (ctx: TaskContextItem): void => {
      this.router.navigate(['/resources/code-systems', ctx.id, 'summary']);
    },
    'code-system-version': (ctx: TaskContextItem): void => {
      this.codeSystemVersionService.load(ctx.id).subscribe(({codeSystem, version}) => {
        this.router.navigate(['/resources/code-systems', codeSystem, 'versions', version, 'summary']);
      });
    },
    'code-system-entity-version': (ctx: TaskContextItem): void => {
      this.codeSystemEntityVersionService.load(ctx.id).subscribe(({id, codeSystem, code}) => {
        this.router.navigate(['/resources/code-systems', codeSystem, 'concepts', code, 'view'], {queryParams: {conceptVersionId: id}});
      });
    },

    // Value Set
    'value-set': (ctx: TaskContextItem): void => {
      this.router.navigate(['/resources/value-sets', ctx.id, 'summary']);
    },
    'value-set-version': (ctx: TaskContextItem): void => {
      this.valueSetVersionService.load(ctx.id).subscribe(({valueSet, version}) => {
        this.router.navigate(['/resources/value-sets', valueSet, 'versions', version, 'summary']);
      });
    },

    // Map Set
    'map-set': (ctx: TaskContextItem): void => {
      this.router.navigate(['/resources/map-sets', ctx.id, 'summary']);
    },
    'map-set-version': (ctx: TaskContextItem): void => {
      this.mapSetVersionService.load(ctx.id).subscribe(({mapSet, version}) => {
        this.router.navigate(['/resources/map-sets', mapSet, 'versions', version, 'summary']);
      });
    },

    // Wiki Page Comment
    'page-comment': (ctx: TaskContextItem): void => {
      this.pageCommentService.search({ids: ctx.id, limit: 1}).pipe(
        mergeMap(resp => this.pageService.searchPageContents({ids: resp.data[0].pageContentId})),
        map(resp => resp.data[0])
      ).subscribe(({slug, spaceId}) => {
        this.router.navigate([`/wiki/${spaceId}/${slug}`], {queryParams: {commentId: ctx.id}});
      });
    }
  };

  public constructor(
    private router: Router,
    private codeSystemEntityVersionService: CodeSystemEntityVersionLibService,
    private codeSystemVersionService: CodeSystemVersionLibService,
    private mapSetVersionService: MapSetVersionLibService,
    private pageCommentService: PageCommentLibService,
    private pageService: PageLibService,
    private snomedTranslationService: SnomedTranslationService,
    private valueSetVersionService: ValueSetVersionLibService,
  ) { }

  public open(ctx: TaskContextItem): void {
    this.handlers[ctx.type]?.(ctx);
  }

  public canOpen = (key: string): boolean => {
    return key in this.handlers;
  };
}

@Component({
  templateUrl: './task-edit.component.html',
  styles: [`
    @import "../../../styles/variables";

    .text-editor-wrapper {
      border-radius: @mui-border-radius-component;
      border: @mui-border;
      margin-block: 0.5rem;
    }

    .text-editor {
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      border-radius: @mui-border-radius-component;

      &:hover {
        background: @mui-border-color-light;
      }
    }
  `]
})
export class TaskEditComponent implements OnInit {
  protected task?: Task;
  protected newStatus?: string;
  protected newActivity?: {visible?: boolean, note?: string} = {};

  protected mode: 'edit' | 'add';
  protected loader = new LoadingManager();

  protected users: User[];
  protected projects: CodeName[];
  protected workflows: Workflow[];

  @ViewChild(NgForm) public form: NgForm;

  public constructor(
    private taskService: TaskService,
    private userService: UserLibService,
    protected authService: AuthService,
    protected contextLinkService: TaskContextLinkService,
    private route: ActivatedRoute,
    private router: Router,
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
    this.loader.wrap('load', this.taskService.loadTask(number)).subscribe(task => {
      this.task = this.writeTask(task);
      this.loadWorkflows(task.project.code);
    });
  }

  private writeTask(task: Task): Task {
    task['edit-mode'] = !task.content;
    task.content ??= '';

    task.type ??= 'task';
    task.status ??= 'requested';
    task.priority ??= 'routine';
    task.project ??= {};
    return task;
  }


  /**/

  private loadData(): void {
    this.loader.wrap('load', forkJoin([
      this.userService.loadAll(),
      this.taskService.loadProjects()
    ])).subscribe(([users, projects]) => {
      this.users = users;
      this.projects = projects;
    });
  }

  protected loadWorkflows(projectCode: string): void {
    if (projectCode) {
      this.taskService.loadProjectWorkflows(projectCode).subscribe(workflows => this.workflows = workflows);
    } else {
      this.workflows = [];
    }
  }


  /**/

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

  protected patch(task: {[key: string]: any}): void {
    if (!this.task.number) {
      return;
    }
    const fields = Object.keys(task).map(name => ({fieldName: name, value: task[name]}));
    this.loader.wrap('save', this.taskService.patch(this.task.number, {fields: fields})).subscribe(t => this.loadTask(t.number));
  }


  protected createActivity(): void {
    const number = this.task.number;
    const note = this.newActivity.note;
    if (isNil(number) || isNil(note)) {
      return;
    }
    this.loader.wrap('save', this.taskService.createActivity(number, note)).subscribe(() => {
      this.loadTask(this.task.number);
      this.newActivity = {note: ''};
    });
  }

  protected updateActivity(id: string, note: string): void {
    const number = this.task.number;
    if (isNil(number) || isNil(id) || isNil(note)) {
      return;
    }
    this.loader.wrap('save', this.taskService.updateActivity(number, id, note)).subscribe(() => {
      this.loadTask(this.task.number);
      this.newActivity = {};
    });
  }

  protected deleteActivity(id: string): void {
    const number = this.task.number;
    this.loader.wrap('delete-activity', this.taskService.deleteActivity(number, id)).subscribe(() => {
      this.loadTask(this.task.number);
    });
  }


  /**/

  protected getTargetStatuses = (wfCode: string, status: string, workflows: Workflow[]): string[] => {
    const wf = workflows?.find(w => w.code === wfCode);
    if (isNil(wf)) {
      return [];
    }
    const statuses = wf.transitions?.filter(t => t.from === status).map(t => t.to);
    if (statuses?.includes('draft')) {
      this.newStatus = 'draft';
    }
    return statuses;
  };

  protected hasTransitions = (activities: TaskActivity[]): TaskActivity[] => {
    return activities?.filter(a => a.note || (this.changeTransitions(a.transition)?.length > 0));
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


  protected isEditable = (el: Task | TaskActivity): boolean => {
    return this.authService.user?.username === el.updatedBy && !(el.context?.map(c => c.type) || []).includes("page-comment");
  };

  protected onEditorClick(wrapper: HTMLElement, ev: MouseEvent, data: {task?: Task; activity?: TaskActivity}): void {
    const path = [];
    let el = ev.target as HTMLElement;
    while (el) {
      path.push(el.localName);
      if (el.parentElement === wrapper || el.parentElement?.localName === "m-markdown") {
        break;
      }
      el = el.parentElement;
    }

    if (path.includes('a')) {
      return;
    }

    if (!this.isEditable(data.task ?? data.activity)) {
      return;
    }

    if (data.task) {
      data.task['new-content'] = data.task.content;
      data.task['edit-mode'] = true;
    } else if (data.activity) {
      data.activity['new-note'] = data.activity.note;
      data.activity['edit-mode'] = true;
    }
  }
}
