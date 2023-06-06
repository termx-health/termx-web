import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {GLOBAL_SEARCH_ROUTES} from './global-search/global-search.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';
import {THESAURUS_ROUTES} from './thesaurus/thesaurus.module';
import {MEASUREMENT_UNIT_ROUTES} from './measurement-unit/measurement-unit.module';
import {FHIR_ROUTES} from './fhir/fhir.module';
import {PROJECT_CTX_ROUTES, PROJECT_ROUTES, TERMINOLOGY_SERVER_ROUTES} from './project/project.module';
import {autoLoginGuard} from 'term-web/core/auth';
import {ProjectContextComponent} from 'term-web/core/context/project-context.component';
import {ProjectContextModule} from 'term-web/core/context/project-context.module';
import {OBSERVATION_DEFINITION_ROUTES} from 'term-web/observation-definition/observation-definition.module';
import {SEQUENCE_ROUTES} from 'term-web/sequence/sequence.module';
import {TASKFLOW_ROUTES} from 'term-web/taskflow/taskflow.module';
import {AppComponent} from 'term-web/app.component';
import {LandingPageComponent} from 'term-web/landing/landing-page.component';


const APP_ROUTES: Routes = [
  {path: 'landing', component: LandingPageComponent},
  {path: 'resources', children: RESOURCES_ROUTES},
  {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}},
  {path: 'integration', children: INTEGRATION_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}},
  {path: 'privileges', children: PRIVILEGES_ROUTES, data: {privilege: ['*.Privilege.view']}},
  {path: 'tools', children: TOOLS_ROUTES},
  {path: 'sequences', children: SEQUENCE_ROUTES},
  {path: 'thesaurus', children: THESAURUS_ROUTES, data: {privilege: ['*.Thesaurus.view']}},
  {path: 'measurement-units', children: MEASUREMENT_UNIT_ROUTES, data: {privilege: ['ucum.CodeSystem.view']}},
  {path: 'terminology-servers', children: TERMINOLOGY_SERVER_ROUTES, data: {privilege: ['*.Project.view']}},
  {path: 'observation-definitions', children: OBSERVATION_DEFINITION_ROUTES, data: {privilege: ['*.ObservationDefinition.view']}},
  {path: 'taskflow', children: TASKFLOW_ROUTES, data: {privilege: ['*.Task.view']}},
  {
    path: 'projects',
    children: [
      {path: '', children: PROJECT_ROUTES},
      {path: 'context', component: ProjectContextComponent, children: PROJECT_CTX_ROUTES}
    ],
    data: {privilege: ['*.Project.view']}
  }
];

const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'landing'},
      {path: '', children: APP_ROUTES},
      {path: 'embedded', pathMatch: 'full', redirectTo: 'embedded/landing'},
      {path: 'embedded', children: APP_ROUTES},
    ],
    component: AppComponent,
    canActivate: [autoLoginGuard]
  },
  {
    path: 'fhir',
    children: FHIR_ROUTES
  },
  {
    path: "**",
    redirectTo: 'landing'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    ProjectContextModule,
    LandingPageComponent
  ],
  exports: [RouterModule]
})
export class RootRoutingModule {
}
