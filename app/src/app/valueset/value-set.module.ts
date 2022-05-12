import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ValueSetListComponent} from './containers/value-set-list.component';
import {ValueSetLibModule} from 'terminology-lib/valueset/value-set-lib.module';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {MarinaUtilModule} from '@kodality-health/marina-util';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TranslateModule} from '@ngx-translate/core';
import {ValueSetEditComponent} from './containers/value-set-edit.component';
import {FormsModule} from '@angular/forms';
import {ValueSetEditVersionsComponent} from './containers/value-set-edit-versions.component';
import {ValueSetVersionEditComponent} from './containers/value-set-version-edit.component';
import {ValueSetVersionEditConceptsComponent} from './containers/value-set-version-edit-concepts.component';
import {ConceptLibModule} from 'terminology-lib/concept/concept-lib.module';


export const VALUE_SET_ROUTES: Routes = [
  {path: '', component: ValueSetListComponent},
  {path: 'add', component: ValueSetEditComponent},
  {path: ':id/edit', component: ValueSetEditComponent},
  {path: ':id/versions/add', component: ValueSetVersionEditComponent},
  {path: ':id/versions/:versionId/edit', component: ValueSetVersionEditComponent},
];

@NgModule({
  declarations: [
    ValueSetListComponent,
    ValueSetEditComponent,
    ValueSetEditVersionsComponent,
    ValueSetVersionEditComponent,
    ValueSetVersionEditConceptsComponent
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