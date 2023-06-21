import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TaskLibService} from 'term-web/taskflow/_lib/services/task-lib-service';
import {ProjectLibService} from 'term-web/taskflow/_lib/services/project-lib.service';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {TaskTypeComponent} from 'term-web/taskflow/_lib/containers/task-type.component';
import {WorkflowLibService} from 'term-web/taskflow/_lib/services/workflow-lib-service';
import {TaskStatusComponent} from 'term-web/taskflow/_lib/containers/task-status.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {UserLibService} from 'term-web/taskflow/_lib/services/user-lib-service';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    CoreUtilModule,
    CoreUiModule,
    ResourcesLibModule,
  ],
  providers: [
    TaskLibService,
    ProjectLibService,
    WorkflowLibService,
    UserLibService,
  ],
  declarations: [TaskTypeComponent, TaskStatusComponent],
  exports: [TaskTypeComponent, TaskStatusComponent]
})
export class TaskflowLibModule {
}
