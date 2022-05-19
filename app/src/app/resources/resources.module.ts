import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CODE_SYSTEM_ROUTES, CodeSystemModule} from './codesystem/code-system.module';
import {VALUE_SET_ROUTES, ValueSetModule} from './valueset/value-set.module';
import {ConceptModule} from './concept/concept.module';
import {DesignationModule} from './designation/designation.module';
import {ResourcesTabsetComponent} from './tabs/resources-tabset.component';
import {SharedModule} from '../shared/shared.module';
import {MAP_SET_ROUTES, MapSetModule} from './mapset/map-set.module';


export const RESOURCES_ROUTES: Routes = [
  {path: '', component: ResourcesTabsetComponent},
  {path: 'code-systems', children: CODE_SYSTEM_ROUTES},
  {path: 'value-sets', children: VALUE_SET_ROUTES},
  {path: 'map-sets', children: MAP_SET_ROUTES},
];

const resourceModules = [
  CodeSystemModule,
  ValueSetModule,
  ConceptModule,
  DesignationModule,
  MapSetModule
];

@NgModule({
  imports: [...resourceModules, SharedModule],
  exports: [...resourceModules],
  declarations: [
    ResourcesTabsetComponent
  ]
})
export class ResourcesModule {
}
