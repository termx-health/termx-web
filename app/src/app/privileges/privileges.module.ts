import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {PrivilegesListComponent} from './containers/privileges-list.component';
import {PrivilegeEditComponent} from './containers/privilege-edit.component';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {PrivilegeService} from './services/privilege.service';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';
import {PrivilegeModule} from 'term-web/privileges/_lib';


export const PRIVILEGES_ROUTES: Routes = [
  {path: '', component: PrivilegesListComponent},
  {path: 'add', component: PrivilegeEditComponent},
  {path: 'edit/:id', component: PrivilegeEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
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
