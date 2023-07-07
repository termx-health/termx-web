import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {TaskLibModule} from 'term-web/task/_lib';
import {TaskListComponent} from 'term-web/task/containers/task-list.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TaskEditComponent} from 'term-web/task/containers/task-edit.component';
import {TaskService} from 'term-web/task/services/task-service';

export const TASK_ROUTES: Routes = [
  {path: '', component: TaskListComponent},
  {path: 'add', data: {privilege: ['*.Task.edit']}, component: TaskEditComponent},
  {path: ':number/edit', data: {privilege: ['*.Task.edit']}, component: TaskEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,

    TaskLibModule,
    ResourcesLibModule
  ],
  declarations: [TaskListComponent, TaskEditComponent],
  providers: [
    TaskService
  ]
})
export class TaskModule {
}
