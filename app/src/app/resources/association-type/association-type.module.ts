import {NgModule} from '@angular/core';
import {AssociationTypeListComponent} from './containers/list/association-type-list.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {AssociationTypeService} from './services/association-type.service';
import {AssociationTypeEditComponent} from './containers/edit/association-type-edit.component';
import {Routes} from '@angular/router';
import {AssociationTypeViewComponent} from './containers/view/association-type-view.component';

export const ASSOCIATION_TYPE_ROUTES: Routes = [
  {path: 'add', component: AssociationTypeEditComponent, data: {privilege: ['*.AssociationType.edit']}},
  {path: ':code/edit', component: AssociationTypeEditComponent, data: {privilege: ['*.AssociationType.edit']}},
  {path: ':code/view', component: AssociationTypeViewComponent},
];

@NgModule({
  imports: [
    CoreUiModule
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
