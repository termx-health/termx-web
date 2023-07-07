import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {isDefined} from '@kodality-web/core-util';
import {Task, TaskLibService} from 'term-web/task/_lib';
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


  public openTask(number: string): void {
    this.router.navigate(['/tasks', number, 'edit']);
  }
}
