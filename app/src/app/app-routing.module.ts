import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';
import {PRIVILEGES_ROUTES} from './privileges/privileges.module';
import {TOOLS_ROUTES} from './tools/tools.module';

const routes: Routes = [
  {path: 'resources', children: RESOURCES_ROUTES, data: {privilege: ['*.view']}},
  {path: 'integration', children: INTEGRATION_ROUTES},
  {path: 'privileges', children: PRIVILEGES_ROUTES},
  {path: 'tools', children: TOOLS_ROUTES}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
