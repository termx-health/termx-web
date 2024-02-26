import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {AssociationTypeEditComponent} from './containers/edit/association-type-edit.component';
import {AssociationTypeListComponent} from './containers/list/association-type-list.component';
import {AssociationTypeViewComponent} from './containers/view/association-type-view.component';
import {AssociationTypeService} from './services/association-type.service';

export const ASSOCIATION_TYPE_ROUTES: Routes = [
  {path: '', component: AssociationTypeListComponent},
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
