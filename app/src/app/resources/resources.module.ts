import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CODE_SYSTEM_ROUTES, CodeSystemModule} from './codesystem/code-system.module';
import {VALUE_SET_ROUTES, ValueSetModule} from './valueset/value-set.module';
import {ConceptModule} from './concept/concept.module';
import {DesignationModule} from './designation/designation.module';
import {ResourcesTabsetComponent} from './tabs/tabset.component';
import {SharedModule} from '../shared/shared.module';


export const RESOURCES_ROUTES: Routes = [
  {path: '', component: ResourcesTabsetComponent},
  {path: 'code-systems', children: CODE_SYSTEM_ROUTES},
  {path: 'value-sets', children: VALUE_SET_ROUTES},
];

const resourceModules = [
  CodeSystemModule,
  ValueSetModule,
  ConceptModule,
  DesignationModule
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
