import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ValueSetListComponent} from './containers/value-set-list.component';
import {ConceptLibModule, DesignationLibModule, ValueSetLibModule} from 'terminology-lib/resources';
import {ValueSetVersionEditComponent} from './containers/version/value-set-version-edit.component';
import {ValueSetVersionConceptsListComponent} from './containers/version/value-set-version-concepts-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {ValueSetService} from './services/value-set.service';
import {ValueSetEditComponent} from './containers/edit/value-set-edit.component';
import {ValueSetVersionsListComponent} from './containers/edit/value-set-versions-list.component';
import {ValueSetVersionViewComponent} from './containers/version/value-set-version-view.component';


export const VALUE_SET_ROUTES: Routes = [
  {path: 'add', component: ValueSetEditComponent},
  {path: ':id/edit', component: ValueSetEditComponent},
  {path: ':id/versions/add', component: ValueSetVersionEditComponent},
  {path: ':id/versions/:version/edit', component: ValueSetVersionEditComponent},
  {path: ':id/versions/:version/view', component: ValueSetVersionViewComponent},
];

@NgModule({
  imports: [
    SharedModule,
    ValueSetLibModule,
    DesignationLibModule,
    ConceptLibModule
  ],
  declarations: [
    ValueSetListComponent,
    ValueSetEditComponent,
    ValueSetVersionsListComponent,
    ValueSetVersionEditComponent,
    ValueSetVersionViewComponent,
    ValueSetVersionConceptsListComponent
  ],
  exports: [
    ValueSetListComponent
  ],
  providers: [
    ValueSetService
  ]
})
export class ValueSetModule {
}
