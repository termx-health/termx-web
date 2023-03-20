import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {PrivilegesListComponent} from './containers/privileges-list.component';
import {PrivilegeEditComponent} from './containers/privilege-edit.component';
import {SharedModule} from '../core/shared/shared.module';
import {PrivilegeService} from './services/privilege.service';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, PrivilegeModule, ValueSetLibModule} from '@terminology/core';


export const PRIVILEGES_ROUTES: Routes = [
  {path: '', component: PrivilegesListComponent},
  {path: 'add', component: PrivilegeEditComponent},
  {path: 'edit/:id', component: PrivilegeEditComponent},
];

@NgModule({
  imports: [
    SharedModule,
    CodeSystemLibModule,
    ValueSetLibModule,
    MapSetLibModule,
    NamingSystemLibModule,
    AssociationLibModule,
    PrivilegeModule
  ],
  declarations: [
    PrivilegeEditComponent,
    PrivilegesListComponent
  ],
  providers: [
    PrivilegeService
  ]
})
export class PrivilegesModule {
}
