import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';
import {GlobalSearchDashboardComponent} from './containers/global-search-dashboard.component';
import {SysLibModule} from 'term-web/sys/_lib';
import {SpaceLibModule} from 'term-web/sys/_lib/space';

export const GLOBAL_SEARCH_ROUTES: Routes = [
  {path: '', component: GlobalSearchDashboardComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    CodeSystemLibModule,
    ValueSetLibModule,
    MapSetLibModule,
    NamingSystemLibModule,
    SysLibModule,
    SpaceLibModule
  ],
  declarations: [
    GlobalSearchDashboardComponent
  ]
})
export class GlobalSearchModule {
}
