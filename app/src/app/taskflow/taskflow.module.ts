import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {TaskflowLibModule} from 'term-web/taskflow/_lib';
import {TaskListComponent} from 'term-web/taskflow/containers/task-list.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TaskEditComponent} from 'term-web/taskflow/containers/task-edit.component';
import {TaskService} from 'term-web/taskflow/services/task-service';

export const TASKFLOW_ROUTES: Routes = [
  {path: '', component: TaskListComponent},
  {path: 'add', data: {privilege: ['*.Task.edit']}, component: TaskEditComponent},
  {path: ':id/edit', data: {privilege: ['*.Task.edit']}, component: TaskEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,

    TaskflowLibModule,
    ResourcesLibModule
  ],
  declarations: [TaskListComponent, TaskEditComponent],
  providers: [
    TaskService
  ]
})
export class TaskflowModule {
}
