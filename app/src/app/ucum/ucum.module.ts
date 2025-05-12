import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {UcumLibModule} from 'term-web/ucum/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {DefinedUnitViewComponent} from './containers/view/defined-unit-view.component';
import {DefinedUnitListComponent} from './containers/list/defined-unit-list.component';
import {UcumService} from './services/ucum.service';
import {UcumMenuComponent} from "./containers/ucum-menu.component";
import {PrefixListComponent} from "./containers/list/prefix-list.component";
import {PrefixViewComponent} from "./containers/view/prefix-view.component";
import {BaseUnitListComponent} from "./containers/list/base-unit-list.component";
import {BaseUnitViewComponent} from "./containers/view/base-unit-view.component";


export const UCUM_ROUTES: Routes = [
  { path: '', component: UcumMenuComponent },
  { path: 'prefixes', component: PrefixListComponent },
  { path: 'prefixes/:code/view', component: PrefixViewComponent },
  { path: 'defined-units', component: DefinedUnitListComponent },
  { path: 'defined-units/:code/view', component: DefinedUnitViewComponent },
  { path: 'base-units', component: BaseUnitListComponent },
  { path: 'base-units/:code/view', component: BaseUnitViewComponent }
];

@NgModule({
  declarations: [
    UcumMenuComponent,
    PrefixListComponent,
    PrefixViewComponent,
    DefinedUnitListComponent,
    DefinedUnitViewComponent,
    BaseUnitListComponent,
    BaseUnitViewComponent
  ],
  imports: [
    CoreUiModule,
    UcumLibModule,
  ],
  providers: [
    UcumService
  ]
})
export class UcumModule {}
