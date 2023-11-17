import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BooleanInput, isDefined} from '@kodality-web/core-util';
import {Task, TaskLibService} from 'term-web/task/_lib';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-resource-tasks-widget',
  templateUrl: 'resource-tasks-widget.component.html'
})
export class ResourceTasksWidgetComponent implements OnChanges {
  @Input() public resourceId: string;
  @Input() public taskFilters: {statuses?: string[]};
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'CodeSystemVersion' | 'ValueSetVersion' | 'MapSetVersion' | 'CodeSystemEntityVersion';
  @Input() public displayType: 'full' | 'content' = 'full';
  @Input() @BooleanInput() public openInNewTab: boolean | string = false;

  protected tasks: Task[];

  private resourceTypeMap: {[key: string]: string} = {
    'CodeSystem': 'code-system',
    'ValueSet': 'value-set',
    'MapSet': 'map-set',
    'CodeSystemVersion': 'code-system-version',
    'ValueSetVersion': 'value-set-version',
    'MapSetVersion': 'map-set-version',
    'CodeSystemEntityVersion': 'code-system-entity-version'
  };

  public constructor(private taskLibService: TaskLibService, private router: Router) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceId'] || changes['resurceType']) && isDefined(this.resourceId) && isDefined(this.resourceType)) {
      this.loadTasks();
    }
  }

  protected openTask(number: string): void {
    if (this.openInNewTab) {
      window.open(window.location.origin + '/tasks/' + number + '/edit', '_blank');
    } else {
      this.router.navigate(['/tasks', number, 'edit']);
    }
  }

  protected filterTask = (task: Task, filters: {statuses: string[]}): boolean => {
    return (!filters?.statuses || filters.statuses.includes(task?.status));
  };

  public loadTasks(): void {
    this.taskLibService.searchTasks({context: this.resourceTypeMap[this.resourceType] + '|' + this.resourceId, limit: 100})
      .subscribe(tasks => this.tasks = tasks.data);
  }
}
