import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ValueSetLibModule} from 'term-web/resources/_lib';
import {DefinedPropertyEditComponent} from 'term-web/resources/defined-property/edit/defined-property-edit.component';
import {DefinedPropertyListComponent} from 'term-web/resources/defined-property/list/defined-property-list.component';
import {DefinedPropertyService} from 'term-web/resources/defined-property/services/defined-property.service';
import {CoreUiModule} from '../../core/ui/core-ui.module';

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
