import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ObservationDefinitionListComponent} from './containers/observation-definition-list.component';
import {ObservationDefinitionService} from './services/observation-definition.service';
import {ObservationDefinitionLibModule} from 'term-web/supplement/_lib';
import {SharedModule} from '../../core/shared/shared.module';

export const OBSERVATION_DEFINITION_ROUTES: Routes = [
  {path: '', component: ObservationDefinitionListComponent},
];


@NgModule({
  imports: [
    SharedModule,
    ObservationDefinitionLibModule,
  ],
  declarations: [
    ObservationDefinitionListComponent
  ],
  providers: [
    ObservationDefinitionService
  ]
})
export class ObservationDefinitionModule {
}
