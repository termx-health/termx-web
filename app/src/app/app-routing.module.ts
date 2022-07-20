import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';
import {GLOBAL_SEARCH_ROUTES} from './globalsearch/global-search.module';
import {AutoLoginAllRoutesGuard} from 'angular-auth-oidc-client';

const routes: Routes = [
  {path: 'resources', children: RESOURCES_ROUTES, data: {privilege: ['*.view']}, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'global-search', children: GLOBAL_SEARCH_ROUTES, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'integration', children: INTEGRATION_ROUTES, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'privileges', children: PRIVILEGES_ROUTES, canActivate: [AutoLoginAllRoutesGuard]},
  {path: 'tools', children: TOOLS_ROUTES, canActivate: [AutoLoginAllRoutesGuard]},
  {path: "**", redirectTo: 'resources'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
