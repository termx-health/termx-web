import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {TERMINOLOGY_SERVICE_API_ROUTES, TerminologyServiceApiModule} from './terminology-service-api/terminology-service-api.module';

export const TOOLS_ROUTES: Routes = [
  {path: 'terminology-service-api', children: TERMINOLOGY_SERVICE_API_ROUTES}
];

@NgModule({
  imports: [
    TerminologyServiceApiModule
  ]
})
export class ToolsModule {
}
