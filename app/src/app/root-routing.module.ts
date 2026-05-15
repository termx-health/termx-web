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
import {FHIR_ROUTES} from 'term-web/fhir/fhir.module';
import {GLOBAL_SEARCH_ROUTES} from 'term-web/global-search/global-search.module';
import {INTEGRATION_ROUTES} from 'term-web/integration/integration.module';
import {UCUM_ROUTES} from 'term-web/ucum/ucum.module';
import {PRIVILEGES_ROUTES} from 'term-web/privileges/privileges.module';
import {RESOURCES_ROUTES} from 'term-web/resources/resources.module';
import {SPACE_CTX_ROUTES, SPACE_ROUTES, SERVER_ROUTES} from 'term-web/sys/space/space.module';
import {ECOSYSTEM_ROUTES} from 'term-web/sys/ecosystem/ecosystem.module';
import {EcosystemService} from 'term-web/sys/ecosystem/services/ecosystem.service';
import {ServerLibService} from 'term-web/sys/_lib/space';
import {WIKI_MANAGEMENT_ROUTES, WIKI_ROUTES} from 'term-web/wiki/wiki.module';


const APP_ROUTES: Routes = [
  {path: 'landing', component: LandingPageComponent},
  {path: 'resources', children: RESOURCES_ROUTES},
  {path: 'resources/implementation-guides', children: IG_ROUTES, data: {privilege: ['*.ImplementationGuide.read']}},
  {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, data: {privilege: ['*.CodeSystem.read', '*.ValueSet.read', '*.MapSet.read']}},
  {path: 'integration', children: INTEGRATION_ROUTES, data: {privilege: ['*.CodeSystem.read', '*.ValueSet.read', '*.MapSet.read']}},
  {path: 'privileges', children: PRIVILEGES_ROUTES, data: {privilege: ['*.Privilege.read']}},
  {path: 'terminology-service-api', children: TERMINOLOGY_SERVICE_API_ROUTES},
  {path: 'sequences', children: SEQUENCE_ROUTES},
  {path: 'wiki', children: WIKI_ROUTES, data: {privilege: ['*.Wiki.read']}},
  {path: 'wiki-management', children: WIKI_MANAGEMENT_ROUTES, data: {privilege: ['*.Wiki.read']}},
  {path: 'modeler', children: MODELER_ROUTES, data: {privilege: ['*.StructureDefinition.read', '*.TransformationDefinition.read']}},
  {path: 'ucum', children: UCUM_ROUTES, data: {privilege: ['ucum.CodeSystem.read']}},
  {path: 'servers', children: SERVER_ROUTES, data: {privilege: ['*.Space.read']}},
  {path: 'observation-definitions', children: OBSERVATION_DEFINITION_ROUTES, data: {privilege: ['*.ObservationDefinition.read']}},
  {path: 'tasks', children: TASK_ROUTES, data: {privilege: ['*.Task.read']}},
  {path: 'fhir', children: FHIR_ROUTES},
  {path: '', children: SYS_ROUTES},
  {
    path: 'spaces',
    children: [
      {path: '', children: SPACE_ROUTES},
      {path: 'context', component: SpaceContextComponent, children: SPACE_CTX_ROUTES}
    ],
    data: {privilege: ['*.Space.read']}
  },
  {path: 'ecosystems', children: ECOSYSTEM_ROUTES, data: {privilege: ['*.Space.read']}, providers: [EcosystemService, ServerLibService]},
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
