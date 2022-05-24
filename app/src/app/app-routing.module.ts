import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RESOURCES_ROUTES} from './resources/resources.module';
import {IntegrationMenuComponent} from './integration/menu/integration-menu.component';

const routes: Routes = [
  {path: 'resources', children: RESOURCES_ROUTES},
  {path: 'integration', component: IntegrationMenuComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
