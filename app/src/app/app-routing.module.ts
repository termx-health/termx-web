import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {INTEGRATION_ROUTES} from './integration/integration.module';

const routes: Routes = [
  {path: 'resources', children: RESOURCES_ROUTES},
  {path: 'integration', children: INTEGRATION_ROUTES}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
