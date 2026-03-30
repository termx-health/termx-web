import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TaskStatusComponent} from 'term-web/task/_lib/components/task-status.component';
import {TaskTypeComponent} from 'term-web/task/_lib/components/task-type.component';
import {TaskLibService} from 'term-web/task/_lib/services/task-lib-service';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';

@NgModule({
    imports: [
        FormsModule,
        MarinaComponentsModule,
        CoreUtilModule,
        CoreUiModule,
        ResourcesLibModule,
        TaskTypeComponent, TaskStatusComponent,
    ],
    providers: [
        TaskLibService,
    ],
    exports: [TaskTypeComponent, TaskStatusComponent]
})
export class TaskLibModule {
}
