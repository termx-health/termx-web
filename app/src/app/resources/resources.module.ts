import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CODE_SYSTEM_ROUTES, CODE_SYSTEM_TAB_ROUTES, CodeSystemModule} from './codesystem/code-system.module';
import {VALUE_SET_ROUTES, VALUE_SET_TAB_ROUTES, ValueSetModule} from './valueset/value-set.module';
import {ConceptModule} from './concept/concept.module';
import {DesignationModule} from './designation/designation.module';
import {TabsComponent} from './tabs/tabs.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';


export const RESOURCES_ROUTES: Routes = [
  {
    path: 'tabs', component: TabsComponent, children: [
      {path: 'code-systems', children: CODE_SYSTEM_TAB_ROUTES},
      {path: 'value-sets', children: VALUE_SET_TAB_ROUTES},
    ]
  },
  {
    path: '', children: [
      {path: 'code-systems', children: CODE_SYSTEM_ROUTES},
      {path: 'value-sets', children: VALUE_SET_ROUTES},
    ]
  },
];

const resourceModules = [
  CodeSystemModule,
  ValueSetModule,
  ConceptModule,
  DesignationModule
];

@NgModule({
  imports: [...resourceModules, MarinaUiModule, RouterModule],
  exports: [...resourceModules],
  declarations: [
    TabsComponent
  ]
})
export class ResourcesModule {
}
