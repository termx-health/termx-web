import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';
import {GLOBAL_SEARCH_ROUTES} from './globalsearch/global-search.module';
import {AutoLoginAllRoutesGuard} from 'angular-auth-oidc-client';
import {MEASUREMENT_UNIT_ROUTES} from './measurementunit/measurement-unit.module';
import {THESAURUS_ROUTES} from './thesaurus/thesaurus.module';

const routes: Routes = [
  {path: 'resources', children: RESOURCES_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view', '*.NamingSystem.view', '*.AssociationType.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'integration', children: INTEGRATION_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view', '*.Snomed.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'privileges', children: PRIVILEGES_ROUTES, data: {privilege: ['*.Privilege.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'tools', children: TOOLS_ROUTES, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'thesaurus', children: THESAURUS_ROUTES, data: {privilege: ['*.Thesaurus.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'measurement-units', children: MEASUREMENT_UNIT_ROUTES, data: {privilege: ['*.MeasurementUnit.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: "**", redirectTo: 'resources'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
