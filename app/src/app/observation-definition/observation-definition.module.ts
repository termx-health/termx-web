import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ObservationDefinitionListComponent} from './containers/observation-definition-list.component';
import {ObservationDefinitionViewComponent} from './containers/edit/observation-definition-view.component';
import {ObservationDefinitionEditComponent} from './containers/edit/observation-definition-edit.component';
import {ObservationDefinitionService} from './services/observation-definition.service';
import {ObservationDefinitionLibModule} from 'app/src/app/observation-definition/_lib';
import {SharedModule} from '../core/shared/shared.module';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {ObservationDefinitionValueComponent} from './containers/edit/value/observation-definition-value.component';
import {ObservationDefinitionMemberListComponent} from './containers/edit/member/observation-definition-member-list.component';
import {
  ObservationDefinitionComponentListComponent
} from 'term-web/observation-definition/containers/edit/component/observation-definition-component-list.component';

export const OBSERVATION_DEFINITION_ROUTES: Routes = [
  {path: '', component: ObservationDefinitionListComponent},
  {path: 'add', data: {privilege: ['*.ObservationDefinition.edit']}, component: ObservationDefinitionEditComponent},
  {path: ':id/edit', data: {privilege: ['*.ObservationDefinition.edit']}, component: ObservationDefinitionEditComponent},
  {path: ':id/view', component: ObservationDefinitionViewComponent},

];


@NgModule({
  imports: [
    SharedModule,
    ObservationDefinitionLibModule,
    ResourcesLibModule
  ],
  declarations: [
    ObservationDefinitionListComponent,
    ObservationDefinitionViewComponent,
    ObservationDefinitionEditComponent,

    ObservationDefinitionValueComponent,
    ObservationDefinitionMemberListComponent,
    ObservationDefinitionComponentListComponent
  ],
  providers: [
    ObservationDefinitionService
  ],
  exports: [
    ObservationDefinitionValueComponent,
    ObservationDefinitionMemberListComponent,
    ObservationDefinitionComponentListComponent
  ]
})
export class ObservationDefinitionModule {
}
