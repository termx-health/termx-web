import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetLibService, ValueSetVersion} from 'term-web/resources/_lib';
import {isDefined} from '@kodality-web/core-util';
import {Task, TaskLibService} from 'term-web/taskflow/_lib';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-resource-tasks-widget',
  templateUrl: 'resource-tasks-widget.component.html'
})
export class ResourceTasksWidgetComponent implements OnChanges {
  @Input() public resourceId: string;
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'CodeSystemVersion' | 'ValueSetVersion';

  protected tasks: Task[];

  public constructor(private taskLibService: TaskLibService, private router: Router) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceId'] || changes['resurceType']) && isDefined(this.resourceId) && isDefined(this.resourceType)) {
      //todo: load tasks
    }
  }


  public openTask(id: number): void {
    this.router.navigate(['/taskflow', id, 'edit']);
  }
}
