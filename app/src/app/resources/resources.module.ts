import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CODE_SYSTEM_FINDER_ROUTES, CODE_SYSTEM_ROUTES, CodeSystemModule} from './codesystem/code-system.module';
import {VALUE_SET_FINDER_ROUTES, VALUE_SET_ROUTES, ValueSetModule} from './valueset/value-set.module';
import {ResourcesTabsetComponent} from './tabs/resources-tabset.component';
import {SharedModule} from '../core/shared/shared.module';
import {MAP_SET_ROUTES, MapSetModule} from './mapset/map-set.module';
import {NAMING_SYSTEM_ROUTES, NamingSystemModule} from './namingsystem/naming-system.module';
import {ASSOCIATION_TYPE_ROUTES, AssociationTypeModule} from './associationtype/association-type.module';


export const RESOURCES_ROUTES: Routes = [
  {path: '', component: ResourcesTabsetComponent},
  {path: 'code-systems', children: CODE_SYSTEM_ROUTES, data: {privilege: ['*.CodeSystem.view']}},
  {path: 'value-sets', children: VALUE_SET_ROUTES, data: {privilege: ['*.ValueSet.view']}},
  {path: 'map-sets', children: MAP_SET_ROUTES, data: {privilege: ['*.MapSet.view']}},
  {path: 'naming-systems', children: NAMING_SYSTEM_ROUTES},
  {path: 'association-types', children: ASSOCIATION_TYPE_ROUTES},
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
    SharedModule,
    NamingSystemModule,
    AssociationTypeModule
  ],
  declarations: [
    ResourcesTabsetComponent,
  ],
  exports: []
})
export class ResourcesModule {
}
