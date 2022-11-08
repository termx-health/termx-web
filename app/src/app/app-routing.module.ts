import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';
import {GLOBAL_SEARCH_ROUTES} from './globalsearch/global-search.module';
import {MEASUREMENT_UNIT_ROUTES} from './measurementunit/measurement-unit.module';
import {THESAURUS_ROUTES} from './thesaurus/thesaurus.module';
import {AutoLoginGuard} from './auth/autologin.guard';

const routes: Routes = [
  {path: 'resources', children: RESOURCES_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view', '*.NamingSystem.view', '*.AssociationType.view']}, canActivate: [AutoLoginGuard]},
  {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}, canActivate: [AutoLoginGuard]},
  {path: 'integration', children: INTEGRATION_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view', '*.Snomed.view']}, canActivate: [AutoLoginGuard]},
  {path: 'privileges', children: PRIVILEGES_ROUTES, data: {privilege: ['*.Privilege.view']}, canActivate: [AutoLoginGuard]},
  {path: 'tools', children: TOOLS_ROUTES, canActivate: [AutoLoginGuard]},
  {path: 'thesaurus', children: THESAURUS_ROUTES, data: {privilege: ['*.Thesaurus.view']}, canActivate: [AutoLoginGuard]},
  {path: 'measurement-units', children: MEASUREMENT_UNIT_ROUTES, data: {privilege: ['*.MeasurementUnit.view']}, canActivate: [AutoLoginGuard]},
  {path: "**", redirectTo: 'resources'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
