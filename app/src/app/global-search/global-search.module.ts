import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {GlobalSearchDashboardComponent} from 'term-web/global-search/containers/global-search-dashboard.component';

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
        GlobalSearchDashboardComponent
    ]
})
export class GlobalSearchModule {
}
