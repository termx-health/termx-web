import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {DEFINED_PROPERTY_ROUTES, DefinedPropertyModule} from 'term-web/resources/defined-property/defined-property.module';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ASSOCIATION_TYPE_ROUTES, AssociationTypeModule} from './association-type/association-type.module';
import {CODE_SYSTEM_FINDER_ROUTES, CODE_SYSTEM_ROUTES, CodeSystemModule} from './code-system/code-system.module';
import {MAP_SET_ROUTES, MapSetModule} from './map-set/map-set.module';
import {NAMING_SYSTEM_ROUTES, NamingSystemModule} from './naming-system/naming-system.module';
import {VALUE_SET_FINDER_ROUTES, VALUE_SET_ROUTES, ValueSetModule} from './value-set/value-set.module';


export const RESOURCES_ROUTES: Routes = [
  {path: 'code-systems', children: CODE_SYSTEM_ROUTES, data: {privilege: ['*.CodeSystem.view']}},
  {path: 'value-sets', children: VALUE_SET_ROUTES, data: {privilege: ['*.ValueSet.view']}},
  {path: 'map-sets', children: MAP_SET_ROUTES, data: {privilege: ['*.MapSet.view']}},
  {path: 'naming-systems', children: NAMING_SYSTEM_ROUTES, data: {privilege: ['*.NamingSystem.view']}},
  {path: 'association-types', children: ASSOCIATION_TYPE_ROUTES, data: {privilege: ['*.AssociationType.view']}},
  {path: 'defined-properties', children: DEFINED_PROPERTY_ROUTES, data: {privilege: ['*.DefinedProperty.view']}},

  {
    path: 'finder', children: [
      {path: 'code-systems', children: CODE_SYSTEM_FINDER_ROUTES, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'value-sets', children: VALUE_SET_FINDER_ROUTES, data: {privilege: ['*.ValueSet.view']}},
    ]
  },
];


@NgModule({
  imports: [
    CodeSystemModule,
    ValueSetModule,
    MapSetModule,
    CoreUiModule,
    NamingSystemModule,
    AssociationTypeModule,
    DefinedPropertyModule
  ],
  declarations: [],
  exports: []
})
export class ResourcesModule {
}
