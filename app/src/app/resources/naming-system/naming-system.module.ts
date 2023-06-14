import {Routes} from '@angular/router';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {NamingSystemListComponent} from './containers/list/naming-system-list.component';
import {NgModule} from '@angular/core';
import {NamingSystemEditComponent} from './containers/edit/naming-system-edit.component';
import {NamingSystemService} from './services/naming-system-service';
import {NamingSystemIdentifierFormComponent} from './containers/edit/naming-system-identifier-form.component';
import {NamingSystemViewComponent} from './containers/view/naming-system-view.component';

export const NAMING_SYSTEM_ROUTES: Routes = [
  {path: '', component: NamingSystemListComponent},
  {path: 'add', component: NamingSystemEditComponent, data: {privilege: ['*.NamingSystem.edit']}},
  {path: ':id/edit', component: NamingSystemEditComponent, data: {privilege: ['*.NamingSystem.edit']}},
  {path: ':id/view', component: NamingSystemViewComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule,
  ],
  declarations: [
    NamingSystemListComponent,
    NamingSystemEditComponent,
    NamingSystemIdentifierFormComponent,
    NamingSystemViewComponent
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
