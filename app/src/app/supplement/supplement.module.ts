import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {OBSERVATION_DEFINITION_ROUTES, ObservationDefinitionModule} from './observation-definition/observation-definition.module';

export const SUPPLEMENTS_ROUTES: Routes = [
  {path: 'observation-definitions', children: OBSERVATION_DEFINITION_ROUTES},
];

@NgModule({
  imports: [
    ObservationDefinitionModule
  ]
})
export class SupplementModule {
}
