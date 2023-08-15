import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {DefinedEntityPropertyService} from 'term-web/resources/defined-entity-property/services/defined-entity-property.service';
import {DefinedEntityPropertyListComponent} from 'term-web/resources/defined-entity-property/list/defined-entity-property-list.component';
import {DefinedEntityPropertyEditComponent} from 'term-web/resources/defined-entity-property/edit/defined-entity-property-edit.component';
import {ValueSetLibModule} from 'term-web/resources/_lib';

export const DEFINED_ENTITY_PROPERTY_ROUTES: Routes = [
  {path: '', component: DefinedEntityPropertyListComponent},
  {path: 'add', component: DefinedEntityPropertyEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/edit', component: DefinedEntityPropertyEditComponent, data: {privilege: ['*.CodeSystem.edit']}}
];

@NgModule({
  imports: [
    CoreUiModule,
    ValueSetLibModule
  ],
  declarations: [
    DefinedEntityPropertyListComponent,
    DefinedEntityPropertyEditComponent
  ],
  providers: [
    DefinedEntityPropertyService
  ]
})
export class DefinedEntityPropertyModule {
}
