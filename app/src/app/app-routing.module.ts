import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {GLOBAL_SEARCH_ROUTES} from './globalsearch/global-search.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';
import {THESAURUS_ROUTES} from './thesaurus/thesaurus.module';
import {MEASUREMENT_UNIT_ROUTES} from './measurementunit/measurement-unit.module';
import {FHIR_ROUTES} from './fhir/fhir.module';
import {PROJECT_CTX_ROUTES, PROJECT_ROUTES, TERMINOLOGY_SERVER_ROUTES} from './project/project.module';
import {SUPPLEMENTS_ROUTES} from './supplement/supplement.module';
import {autoLoginGuard} from 'term-web/core/auth';
import {ProjectContextComponent} from 'term-web/core/context/project-context.component';
import {ProjectContextModule} from 'term-web/core/context/project-context.module';


const routes: Routes = [
  {
    path: '', children: [
      {
        path: 'resources',
        children: RESOURCES_ROUTES,
        data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view', '*.NamingSystem.view', '*.AssociationType.view']}
      },
      {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}},
      {path: 'integration', children: INTEGRATION_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view', '*.Snomed.view']}},
      {path: 'privileges', children: PRIVILEGES_ROUTES, data: {privilege: ['*.Privilege.view']}},
      {path: 'tools', children: TOOLS_ROUTES},
      {path: 'thesaurus', children: THESAURUS_ROUTES, data: {privilege: ['*.Thesaurus.view']}},
      {path: 'measurement-units', children: MEASUREMENT_UNIT_ROUTES, data: {privilege: ['*.MeasurementUnit.view']}},
      {path: 'fhir', children: FHIR_ROUTES, data: {pageType: 'fhir'}},
      {path: 'terminology-servers', children: TERMINOLOGY_SERVER_ROUTES, data: {privilege: ['*.TerminologyServer.view']}},
      {path: 'supplements', children: SUPPLEMENTS_ROUTES},
      {
        path: 'projects', children: [
          {path: '', children: PROJECT_ROUTES},
          {path: 'context', component: ProjectContextComponent, children: PROJECT_CTX_ROUTES}
        ],
        data: {privilege: ['*.Project.view']}
      }
    ],
    canActivate: [autoLoginGuard]
  },
  {path: "**", redirectTo: 'resources'}
];

@NgModule({
  imports: [ProjectContextModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
