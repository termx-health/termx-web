import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {GlobalSearchDashboardComponent} from './containers/global-search-dashboard.component';
import {CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';

export const GLOBAL_SEARCH_ROUTES: Routes = [
  {path: '', component: GlobalSearchDashboardComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
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
