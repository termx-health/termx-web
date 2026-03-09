import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {PrivilegeModule} from 'term-web/privileges/_lib';
import {SysLibModule} from 'term-web/sys/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {PrivilegeEditComponent} from 'term-web/privileges/containers/privilege-edit.component';
import {PrivilegesListComponent} from 'term-web/privileges/containers/privileges-list.component';
import {PrivilegeService} from 'term-web/privileges/services/privilege.service';


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
        SysLibModule,
        PrivilegeModule,
        PrivilegeEditComponent,
        PrivilegesListComponent
    ],
    providers: [
        PrivilegeService
    ]
})
export class PrivilegesModule {
}
