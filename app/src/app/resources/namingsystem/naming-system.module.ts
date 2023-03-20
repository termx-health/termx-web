import {Routes} from '@angular/router';
import {SharedModule} from '../../core/shared/shared.module';
import {ResourcesLibModule} from '@terminology/core';
import {NamingSystemListComponent} from './containers/list/naming-system-list.component';
import {NgModule} from '@angular/core';
import {NamingSystemEditComponent} from './containers/edit/naming-system-edit.component';
import {NamingSystemService} from './services/naming-system-service';
import {NamingSystemIdentifierFormComponent} from './containers/edit/naming-system-identifier-form.component';
import {NamingSystemViewComponent} from './containers/view/naming-system-view.component';

export const NAMING_SYSTEM_ROUTES: Routes = [
  {path: 'add', component: NamingSystemEditComponent, data: {privilege: ['*.NamingSystem.edit']}},
  {path: ':id/edit', component: NamingSystemEditComponent, data: {privilege: ['*.NamingSystem.edit']}},
  {path: ':id/view', component: NamingSystemViewComponent},
];

@NgModule({
  imports: [
    SharedModule,
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
