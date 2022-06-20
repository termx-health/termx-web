import {Routes} from '@angular/router';
import {SharedModule} from '../../core/shared/shared.module';
import {ResourcesLibModule} from 'terminology-lib/resources/resources-lib.module';
import {NamingSystemListComponent} from './containers/list/naming-system-list.component';
import {NgModule} from '@angular/core';

export const NAMING_SYSTEM_ROUTES: Routes = [
];

@NgModule({
  imports: [
    SharedModule,
    ResourcesLibModule,
  ],
  declarations: [
    NamingSystemListComponent
  ],
  exports: [
    NamingSystemListComponent
  ]
})
export class NamingSystemModule {
}
