import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {DEFINED_PROPERTY_ROUTES, DefinedPropertyModule} from 'term-web/resources/defined-property/defined-property.module';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {ASSOCIATION_TYPE_ROUTES, AssociationTypeModule} from 'term-web/resources/association-type/association-type.module';
import {CODE_SYSTEM_FINDER_ROUTES, CODE_SYSTEM_ROUTES, CodeSystemModule} from 'term-web/resources/code-system/code-system.module';
import {MAP_SET_ROUTES, MapSetModule} from 'term-web/resources/map-set/map-set.module';
import {NAMING_SYSTEM_ROUTES, NamingSystemModule} from 'term-web/resources/naming-system/naming-system.module';
import {VALUE_SET_FINDER_ROUTES, VALUE_SET_ROUTES, ValueSetModule} from 'term-web/resources/value-set/value-set.module';


export const RESOURCES_ROUTES: Routes = [
  {path: 'code-systems', children: CODE_SYSTEM_ROUTES, data: {privilege: ['*.CodeSystem.read']}},
  {path: 'value-sets', children: VALUE_SET_ROUTES, data: {privilege: ['*.ValueSet.read']}},
  {path: 'map-sets', children: MAP_SET_ROUTES, data: {privilege: ['*.MapSet.read']}},
  {path: 'naming-systems', children: NAMING_SYSTEM_ROUTES, data: {privilege: ['*.NamingSystem.read']}},
  {path: 'association-types', children: ASSOCIATION_TYPE_ROUTES, data: {privilege: ['*.AssociationType.read']}},
  {path: 'defined-properties', children: DEFINED_PROPERTY_ROUTES, data: {privilege: ['*.DefinedProperty.read']}},

  {
    path: 'finder', children: [
      {path: 'code-systems', children: CODE_SYSTEM_FINDER_ROUTES, data: {privilege: ['*.CodeSystem.read']}},
      {path: 'value-sets', children: VALUE_SET_FINDER_ROUTES, data: {privilege: ['*.ValueSet.read']}},
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
