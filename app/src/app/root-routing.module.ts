import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from 'term-web/app.component';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';
import {SpaceContextModule} from 'term-web/core/context/space-context.module';
import {IG_ROUTES} from 'term-web/implementation-guide/implementation-guide.module';
import {LandingPageComponent} from 'term-web/landing/landing-page.component';
import {MODELER_ROUTES} from 'term-web/modeler/modeler.module';
import {OBSERVATION_DEFINITION_ROUTES} from 'term-web/observation-definition/observation-definition.module';
import {SEQUENCE_ROUTES} from 'term-web/sequence/sequence.module';
import {SYS_ROUTES} from 'term-web/sys/sys.module';
import {TASK_ROUTES} from 'term-web/task/task.module';
import {TERMINOLOGY_SERVICE_API_ROUTES} from 'term-web/terminology-service-api/terminology-service-api.module';
import {FHIR_ROUTES} from './fhir/fhir.module';
import {GLOBAL_SEARCH_ROUTES} from './global-search/global-search.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {MEASUREMENT_UNIT_ROUTES} from './measurement-unit/measurement-unit.module';
import {UCUM_ROUTES} from './ucum/ucum.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {SPACE_CTX_ROUTES, SPACE_ROUTES, TERMINOLOGY_SERVER_ROUTES} from './sys/space/space.module';
import {WIKI_MANAGEMENT_ROUTES, WIKI_ROUTES} from './wiki/wiki.module';


const APP_ROUTES: Routes = [
  {path: 'landing', component: LandingPageComponent},
  {path: 'resources', children: RESOURCES_ROUTES},
  {path: 'resources/implementation-guides', children: IG_ROUTES, data: {privilege: ['*.ImplementationGuide.view']}},
  {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}},
  {path: 'integration', children: INTEGRATION_ROUTES, data: {privilege: ['*.CodeSystem.view', '*.ValueSet.view', '*.MapSet.view']}},
  {path: 'privileges', children: PRIVILEGES_ROUTES, data: {privilege: ['*.Privilege.view']}},
  {path: 'terminology-service-api', children: TERMINOLOGY_SERVICE_API_ROUTES},
  {path: 'sequences', children: SEQUENCE_ROUTES},
  {path: 'wiki', children: WIKI_ROUTES, data: {privilege: ['*.Wiki.view']}},
  {path: 'wiki-management', children: WIKI_MANAGEMENT_ROUTES, data: {privilege: ['*.Wiki.view']}},
  {path: 'modeler', children: MODELER_ROUTES, data: {privilege: ['*.StructureDefinition.view', '*.TransformationDefinition.view']}},
  {path: 'measurement-units', children: MEASUREMENT_UNIT_ROUTES, data: {privilege: ['ucum.CodeSystem.view']}},
  {path: 'ucum', children: UCUM_ROUTES, data: {privilege: ['ucum.CodeSystem.view']}},
  {path: 'terminology-servers', children: TERMINOLOGY_SERVER_ROUTES, data: {privilege: ['*.Space.view']}},
  {path: 'observation-definitions', children: OBSERVATION_DEFINITION_ROUTES, data: {privilege: ['*.ObservationDefinition.view']}},
  {path: 'tasks', children: TASK_ROUTES, data: {privilege: ['*.Task.view']}},
  {path: 'fhir', children: FHIR_ROUTES},
  {path: '', children: SYS_ROUTES},
  {
    path: 'spaces',
    children: [
      {path: '', children: SPACE_ROUTES},
      {path: 'context', component: SpaceContextComponent, children: SPACE_CTX_ROUTES}
    ],
    data: {privilege: ['*.Space.view']}
  },
  {path: 'info', loadComponent: () => import('./core/info/info.component')}
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
    // canActivate: [autoLoginGuard]
  },
  {
    path: "**",
    redirectTo: 'landing'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    SpaceContextModule,
    LandingPageComponent
  ],
  exports: [RouterModule]
})
export class RootRoutingModule {
}
