import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SharedModule} from '../core/shared/shared.module';
import {GlobalSearchDashboardComponent} from './containers/global-search-dashboard.component';
import {CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';

export const GLOBAL_SEARCH_ROUTES: Routes = [
  {path: '', component: GlobalSearchDashboardComponent},
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
    GlobalSearchDashboardComponent
  ]
})
export class GlobalSearchModule {
}
