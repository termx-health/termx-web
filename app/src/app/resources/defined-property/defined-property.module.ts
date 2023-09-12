import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {DefinedPropertyService} from 'term-web/resources/defined-property/services/defined-property.service';
import {DefinedPropertyListComponent} from 'term-web/resources/defined-property/list/defined-property-list.component';
import {DefinedPropertyEditComponent} from 'term-web/resources/defined-property/edit/defined-property-edit.component';
import {ValueSetLibModule} from 'term-web/resources/_lib';

export const DEFINED_PROPERTY_ROUTES: Routes = [
  {path: '', component: DefinedPropertyListComponent},
  {path: 'add', component: DefinedPropertyEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/edit', component: DefinedPropertyEditComponent, data: {privilege: ['*.CodeSystem.edit']}}
];

@NgModule({
  imports: [
    CoreUiModule,
    ValueSetLibModule
  ],
  declarations: [
    DefinedPropertyListComponent,
    DefinedPropertyEditComponent
  ],
  providers: [
    DefinedPropertyService
  ]
})
export class DefinedPropertyModule {
}
