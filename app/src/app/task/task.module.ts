import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TaskLibModule} from 'term-web/task/_lib';
import {TaskEditComponent} from 'term-web/task/containers/task-edit.component';
import {TaskListComponent} from 'term-web/task/containers/task-list.component';
import {TaskService} from 'term-web/task/services/task-service';
import {UserLibModule} from 'term-web/user/_lib';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';

export const TASK_ROUTES: Routes = [
  {path: '', component: TaskListComponent},
  {path: 'add', data: {privilege: ['*.Task.edit']}, component: TaskEditComponent},
  {path: ':number/edit', data: {privilege: ['*.Task.edit']}, component: TaskEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,

    TaskLibModule,
    ResourcesLibModule,
    WikiLibModule,
    UserLibModule
  ],
  declarations: [TaskListComponent, TaskEditComponent],
  providers: [
    TaskService
  ]
})
export class TaskModule {
}
