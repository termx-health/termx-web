import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ObservationDefinitionLibModule} from 'app/src/app/observation-definition/_lib';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {
  ObservationDefinitionComponentListComponent
} from 'term-web/observation-definition/containers/edit/component/observation-definition-component-list.component';
import {
  ObservationDefinitionInterpretationListComponent
} from 'term-web/observation-definition/containers/edit/interpretation/observation-definition-interpretation-list.component';
import {ObservationDefinitionMappingListComponent} from 'term-web/observation-definition/containers/edit/mapping/observation-definition-mapping-list.component';
import {ObservationDefinitionProtocolComponent} from 'term-web/observation-definition/containers/edit/protocol/observation-definition-protocol.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ObservationDefinitionMemberListComponent} from './containers/edit/member/observation-definition-member-list.component';
import {ObservationDefinitionEditComponent} from './containers/edit/observation-definition-edit.component';
import {ObservationDefinitionViewComponent} from './containers/edit/observation-definition-view.component';
import {ObservationDefinitionValueComponent} from './containers/edit/value/observation-definition-value.component';
import {ObservationDefinitionListComponent} from './containers/observation-definition-list.component';
import {ObservationDefinitionService} from './services/observation-definition.service';

export const OBSERVATION_DEFINITION_ROUTES: Routes = [
  {path: '', component: ObservationDefinitionListComponent},
  {path: 'add', data: {privilege: ['*.ObservationDefinition.edit']}, component: ObservationDefinitionEditComponent},
  {path: ':id/edit', data: {privilege: ['*.ObservationDefinition.edit']}, component: ObservationDefinitionEditComponent},
  {path: ':id/view', component: ObservationDefinitionViewComponent},
];


@NgModule({
  imports: [
    CoreUiModule,
    ObservationDefinitionLibModule,
    ResourcesLibModule,
    IntegrationLibModule
  ],
  declarations: [
    ObservationDefinitionListComponent,
    ObservationDefinitionViewComponent,
    ObservationDefinitionEditComponent,

    ObservationDefinitionValueComponent,
    ObservationDefinitionMemberListComponent,
    ObservationDefinitionComponentListComponent,
    ObservationDefinitionProtocolComponent,
    ObservationDefinitionInterpretationListComponent,
    ObservationDefinitionMappingListComponent,

  ],
  providers: [
    ObservationDefinitionService
  ],
  exports: [
    ObservationDefinitionValueComponent,
    ObservationDefinitionMemberListComponent,
    ObservationDefinitionComponentListComponent,
    ObservationDefinitionProtocolComponent,
    ObservationDefinitionInterpretationListComponent,
    ObservationDefinitionMappingListComponent,
  ]
})
export class ObservationDefinitionModule {
}
