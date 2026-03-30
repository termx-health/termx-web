import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { DestroyService, isNil, LoadingManager, validateForm, ApplyPipe } from '@kodality-web/core-util';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';
import {Task, TaskContextItem} from 'term-web/task/_lib';
import {TaskService} from 'term-web/task/services/task-service';
import { MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiTextareaModule, MuiButtonModule } from '@kodality-web/marina-ui';

import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ValueSetVersionSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-version-select.component';
import { MapSetVersionSelectComponent } from 'term-web/resources/_lib/map-set/containers/map-set-version-select.component';
import { UserSelectComponent } from 'term-web/user/_lib/components/user-select.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-resource-task-modal',
    templateUrl: './resource-task-modal-component.html',
    providers: [DestroyService],
    imports: [MuiModalModule, MarinPageLayoutModule, FormsModule, MuiFormModule, CodeSystemVersionSelectComponent, ValueSetVersionSelectComponent, MapSetVersionSelectComponent, UserSelectComponent, MuiTextareaModule, MuiButtonModule, TranslatePipe, ApplyPipe]
})
export class ResourceTaskModalComponent {
  private taskService = inject(TaskService);

  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'StructureDefinition';
  @Output() public taskCreated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params?: TaskModalParams;
  protected loader = new LoadingManager();

  protected resourceContextMap = {
    'CodeSystem': 'code-system',
    'ValueSet': 'value-set',
    'MapSet': 'map-set',
    'StructureDefinition': 'structure-definition'
  };

  protected resourceLinkMap = {
    'CodeSystem': 'csv',
    'ValueSet': 'vsv',
    'MapSet': 'msv',
    'StructureDefinition': 'sdv'
  };


  @ViewChild("form") public form?: NgForm;

  public toggleModal(params?: TaskModalParams): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public createTask(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const task = new Task();
    task.assignee = this.params.assignee;
    task.workflow = this.params.workflowPrefix + '-' + this.params.type;
    task.title = this.composeTitle(this.params);
    task.content = this.composeContent(this.params);
    task.context = this.mapContext(this.params);
    this.loader.wrap('create-task', this.taskService.save(task)).subscribe(() => {
      this.taskCreated.emit();
      this.toggleModal();
    });
  }

  private mapContext(params: TaskModalParams): TaskContextItem[] {
    return [
      {id: params.context.resourceId, type: this.resourceContextMap[this.resourceType]},
      {id: params.context.resourceVersionId || params.resourceVersion?.id, type: `${this.resourceContextMap[this.resourceType]}-version`}
    ];
  }

  private composeTitle(params: TaskModalParams): string {
    return `${this.resourceType} ${params.context.resourceId} version ${params.context.resourceVersionVersion || params.resourceVersion?.version} ${params.type}`;
  }

  private composeContent(params: TaskModalParams): string {
    let title = `${(params.type === 'review' ? 'Review' : 'Approve')} the content of the ${this.resourceType} ` +
      `[${params.context.resourceId}|${params.context.resourceVersionVersion || params.resourceVersion?.version}]` +
      `(${this.resourceLinkMap[this.resourceType]}:${params.context.resourceId}|${params.context.resourceVersionVersion || params.resourceVersion?.version})`;
    if (params.comment) {
      title += `\n${params.comment}`;
    }
    return title;
  }

  protected getRoles = (ctx: TaskModalParamsContext): string[] => {
    return [`${ctx.resourceId}.${this.resourceType}.edit`, `${ctx.resourceId}.${this.resourceType}.publish`];
  };

  protected versionMissing = (ctx: TaskModalParamsContext): boolean => {
    return isNil(ctx?.resourceVersionId) || isNil(ctx?.resourceVersionId);
  };
}

export class TaskModalParams {
  public assignee?: string;
  public type?: 'review' | 'approval';
  public workflowPrefix?: 'version' | 'concept';
  public context?: TaskModalParamsContext;
  public comment?: string;
  public resourceVersion?: ResourceVersion;
}

export class TaskModalParamsContext {
  public resourceId?: string;
  public resourceVersionId?: number;
  public resourceVersionVersion?: string;
}
