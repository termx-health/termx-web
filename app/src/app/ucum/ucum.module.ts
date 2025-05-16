import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {UcumLibModule} from 'term-web/ucum/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {DefinedUnitViewComponent} from './containers/view/defined-unit/defined-unit-view.component';
import {DefinedUnitListComponent} from './containers/list/defined-unit/defined-unit-list.component';
import {UcumMenuComponent} from "./containers/ucum-menu.component";
import {PrefixListComponent} from "./containers/list/prefix/prefix-list.component";
import {PrefixViewComponent} from "./containers/view/prefix/prefix-view.component";
import {BaseUnitListComponent} from "./containers/list/base-unit/base-unit-list.component";
import {BaseUnitViewComponent} from "./containers/view/base-unit/base-unit-view.component";
import {AnalyseComponent} from "./containers/operations/analyse/analyse.component";
import {CanonicaliseComponent} from "./containers/operations/canonicalise/canonicalise.component";
import {ValidateComponent} from "./containers/operations/validate/validate.component";
import {ConvertComponent} from "./containers/operations/convert/convert.component";


export const UCUM_ROUTES: Routes = [
  { path: '', component: UcumMenuComponent },
  { path: 'prefixes', component: PrefixListComponent },
  { path: 'prefixes/:code', component: PrefixViewComponent },
  { path: 'defined-units', component: DefinedUnitListComponent },
  { path: 'defined-units/:code', component: DefinedUnitViewComponent },
  { path: 'base-units', component: BaseUnitListComponent },
  { path: 'base-units/:code', component: BaseUnitViewComponent },
  { path: 'analyse', component: AnalyseComponent },
  { path: 'canonicalise', component: CanonicaliseComponent },
  { path: 'validate', component: ValidateComponent },
  { path: 'convert', component: ConvertComponent }
];

@NgModule({
  declarations: [
    UcumMenuComponent,
    PrefixListComponent,
    PrefixViewComponent,
    DefinedUnitListComponent,
    DefinedUnitViewComponent,
    BaseUnitListComponent,
    BaseUnitViewComponent,
    AnalyseComponent,
    CanonicaliseComponent,
    ValidateComponent,
    ConvertComponent
  ],
  imports: [
    CoreUiModule,
    UcumLibModule,
  ]
})
export class UcumModule {}
