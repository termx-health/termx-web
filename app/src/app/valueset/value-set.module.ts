import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ValueSetListComponent} from './containers/value-set-list.component';
import {ValueSetLibModule} from 'terminology-lib/valueset/value-set-lib.module';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {MarinaUtilModule} from '@kodality-health/marina-util';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TranslateModule} from '@ngx-translate/core';
import { ValueSetFormComponent } from './containers/value-set-form.component';
import {FormsModule} from '@angular/forms';
import { ValueSetFormVersionsComponent } from './containers/value-set-form-versions.component';
import { ValueSetVersionFormComponent } from './containers/value-set-version-form.component';
import { ValueSetVersionConceptListComponent } from './containers/value-set-version-concept-list.component';
import {ConceptLibModule} from 'terminology-lib/concept/concept-lib.module';


export const VALUE_SET_ROUTES: Routes = [
  {path: '', component: ValueSetListComponent},
  {path: 'add', component: ValueSetFormComponent},
  {path: ':id/edit', component: ValueSetFormComponent},
  {path: ':id/versions/add', component: ValueSetVersionFormComponent},
  {path: ':id/versions/:versionId/edit', component: ValueSetVersionFormComponent},
];

@NgModule({
  declarations: [
    ValueSetListComponent,
    ValueSetFormComponent,
    ValueSetFormVersionsComponent,
    ValueSetVersionFormComponent,
    ValueSetVersionConceptListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ValueSetLibModule,
    ConceptLibModule,

    MarinaUiModule,
    MarinaUtilModule,
    CoreUtilModule,
    FormsModule
  ]
})
export class ValueSetModule {
}