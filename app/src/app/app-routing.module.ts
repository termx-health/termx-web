import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {
  CodeSystem as TermsuppCodeSystem,
  CodeSystemProvider as TermsuppCodeSystemProvider,
  TERM_SUPPLEMENT_API_URL
} from '@terminology/supplement-module-providers';
import {autoLoginGuard, CodeSystemLibService} from '@terminology/core';
import {ProjectContextModule} from './core/context/project-context.module';
import {map, Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {GLOBAL_SEARCH_ROUTES} from './globalsearch/global-search.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';
import {THESAURUS_ROUTES} from './thesaurus/thesaurus.module';
import {MEASUREMENT_UNIT_ROUTES} from './measurementunit/measurement-unit.module';
import {FHIR_ROUTES} from './fhir/fhir.module';
import {PROJECT_CTX_ROUTES, PROJECT_ROUTES, TERMINOLOGY_SERVER_ROUTES} from './project/project.module';
import {ProjectContextComponent} from './core/context/project-context.component';
import {SearchResult} from '@kodality-web/core-util';

class SupplementCodeSystemProvider extends TermsuppCodeSystemProvider {
  public constructor(private codeSystemService: CodeSystemLibService) {
    super();
  }

  public getCodeSystems(): Observable<TermsuppCodeSystem[]> {
    return this.codeSystemService.search({limit: 10}).pipe(
      map(resp => SearchResult.map(resp, c => ({id: c.id, code: c.uri})).data)
    );
  }
}

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
  {
    path: 'supplements',
    loadChildren: () => import('@terminology/supplement-module').then(m => m.SupplementModule),
    providers: [
      {provide: TERM_SUPPLEMENT_API_URL, useValue: environment.terminologyApi},
      {provide: TermsuppCodeSystemProvider, useClass: SupplementCodeSystemProvider, deps: [CodeSystemLibService]}
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
