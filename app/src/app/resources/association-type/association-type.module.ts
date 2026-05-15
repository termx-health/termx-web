import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {AssociationTypeEditComponent} from 'term-web/resources/association-type/containers/edit/association-type-edit.component';
import {AssociationTypeListComponent} from 'term-web/resources/association-type/containers/list/association-type-list.component';
import {AssociationTypeViewComponent} from 'term-web/resources/association-type/containers/view/association-type-view.component';
import {AssociationTypeService} from 'term-web/resources/association-type/services/association-type.service';

export const ASSOCIATION_TYPE_ROUTES: Routes = [
  {path: '', component: AssociationTypeListComponent},
  {path: 'add', component: AssociationTypeEditComponent, data: {privilege: ['*.AssociationType.write']}},
  {path: ':code/edit', component: AssociationTypeEditComponent, data: {privilege: ['*.AssociationType.write']}},
  {path: ':code/view', component: AssociationTypeViewComponent},
];

@NgModule({
    imports: [
        CoreUiModule,
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
