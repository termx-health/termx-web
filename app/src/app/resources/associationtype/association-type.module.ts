import {NgModule} from '@angular/core';
import {AssociationTypeListComponent} from './containers/list/association-type-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {AssociationTypeService} from './services/association-type.service';
import {AssociationTypeEditComponent} from './containers/edit/association-type-edit.component';
import {Routes} from '@angular/router';
import {AssociationTypeViewComponent} from './containers/view/association-type-view.component';

export const ASSOCIATION_TYPE_ROUTES: Routes = [
  {path: 'add', component: AssociationTypeEditComponent},
  {path: ':code/edit', component: AssociationTypeEditComponent},
  {path: ':code/view', component: AssociationTypeViewComponent},
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    AssociationTypeListComponent,
    AssociationTypeEditComponent,
    AssociationTypeViewComponent
  ],
  providers: [
    AssociationTypeService
  ],
  exports: [
    AssociationTypeListComponent
  ]
})
export class AssociationTypeModule {
}