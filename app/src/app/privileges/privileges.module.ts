import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {PrivilegesListComponent} from './containers/privileges-list.component';
import {PrivilegeEditComponent} from './containers/privilege-edit.component';
import {SharedModule} from '../core/shared/shared.module';
import {PrivilegeService} from './services/privilege.service';
import {CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from 'terminology-lib/resources';


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
    NamingSystemLibModule
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
