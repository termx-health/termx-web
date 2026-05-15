import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {NamingSystemEditComponent} from 'term-web/resources/naming-system/containers/edit/naming-system-edit.component';
import {NamingSystemIdentifierFormComponent} from 'term-web/resources/naming-system/containers/edit/naming-system-identifier-form.component';
import {NamingSystemListComponent} from 'term-web/resources/naming-system/containers/list/naming-system-list.component';
import {NamingSystemViewComponent} from 'term-web/resources/naming-system/containers/view/naming-system-view.component';
import {NamingSystemService} from 'term-web/resources/naming-system/services/naming-system-service';

export const NAMING_SYSTEM_ROUTES: Routes = [
  {path: '', component: NamingSystemListComponent},
  {path: 'add', component: NamingSystemEditComponent, data: {privilege: ['*.NamingSystem.write']}},
  {path: ':id/edit', component: NamingSystemEditComponent, data: {privilege: ['*.NamingSystem.write']}},
  {path: ':id/view', component: NamingSystemViewComponent},
];

@NgModule({
    imports: [
        CoreUiModule,
        ResourcesLibModule,
        NamingSystemListComponent,
        NamingSystemEditComponent,
        NamingSystemIdentifierFormComponent,
        NamingSystemViewComponent,
    ],
    exports: [
        NamingSystemListComponent
    ],
    providers: [
        NamingSystemService
    ]
})
export class NamingSystemModule {
}
