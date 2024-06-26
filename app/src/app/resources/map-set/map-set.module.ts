import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ObservationDefinitionLibModule} from 'term-web/observation-definition/_lib';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CodeSystemModule} from 'term-web/resources/code-system/code-system.module';
import {MapSetPropertiesComponent} from 'term-web/resources/map-set/containers/edit/property/map-set-properties.component';
import {MapSetProvenancesComponent} from 'term-web/resources/map-set/containers/provenance/map-set-provenances.component';
import {MapSetSummaryComponent} from 'term-web/resources/map-set/containers/summary/map-set-summary.component';
import {MapSetInfoWidgetComponent} from 'term-web/resources/map-set/containers/summary/widgets/map-set-info-widget.component';
import {MapSetVersionsWidgetComponent} from 'term-web/resources/map-set/containers/summary/widgets/map-set-versions-widget.component';
import {MapSetScopeFormComponent} from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import {MapSetAssociationListComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-list.component';
import {
  MapSetExternalSourceConceptListComponent
} from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-external-source-concept-list.component';
import {MapSetSourceConceptListComponent} from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-source-concept-list.component';
import {MapSetUnmappedConceptListComponent} from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-unmapped-concept-list.component';
import {MapSetVersionSummaryComponent} from 'term-web/resources/map-set/containers/version/summary/map-set-version-summary.component';
import {MapSetPropertyValueInputComponent} from 'term-web/resources/map-set/containers/version/summary/property-values/map-set-property-value-input.component';
import {MapSetPropertyValuesComponent} from 'term-web/resources/map-set/containers/version/summary/property-values/map-set-property-values.component';
import {MapSetVersionInfoWidgetComponent} from 'term-web/resources/map-set/containers/version/summary/widgets/map-set-version-info-widget.component';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {SysLibModule} from 'term-web/sys/_lib';
import {UserLibModule} from 'term-web/user/_lib';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {MapSetEditComponent} from './containers/edit/map-set-edit.component';
import {MapSetListComponent} from './containers/list/map-set-list.component';
import {MapSetVersionEditComponent} from './containers/version/edit/map-set-version-edit.component';
import {MapSetService} from './services/map-set-service';

export const MAP_SET_ROUTES: Routes = [
  {path: '', component: MapSetListComponent},
  {path: 'add', component: MapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/edit', component: MapSetEditComponent, data: {privilege: ['{id}.MapSet.edit']}},
  {path: ':id/summary', component: MapSetSummaryComponent, data: {privilege: ['{id}.MapSet.view']}},
  {path: ':id/provenances', component: MapSetProvenancesComponent, data: {privilege: ['{id}.MapSet.view']}},

  {path: ':id/versions/add', component: MapSetVersionEditComponent, data: {privilege: ['{id}.MapSet.edit']}},
  {path: ':id/versions/:versionCode/summary', component: MapSetVersionSummaryComponent, data: {privilege: ['{id}.MapSet.view']}},
  {path: ':id/versions/:versionCode/provenances', component: MapSetProvenancesComponent, data: {privilege: ['{id}.MapSet.view']}},
  {path: ':id/versions/:versionCode/edit', component: MapSetVersionEditComponent, data: {privilege: ['{id}.MapSet.edit']}},

];

@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule,
    CodeSystemModule,
    ResourceModule,
    SequenceLibModule,
    SysLibModule,
    UserLibModule,
    ObservationDefinitionLibModule
  ],
  declarations: [
    MapSetListComponent,

    MapSetEditComponent,
    MapSetPropertiesComponent,
    MapSetScopeFormComponent,
    MapSetSummaryComponent,
    MapSetInfoWidgetComponent,
    MapSetVersionsWidgetComponent,
    MapSetProvenancesComponent,

    MapSetVersionEditComponent,
    MapSetVersionSummaryComponent,
    MapSetVersionInfoWidgetComponent,
    MapSetSourceConceptListComponent,
    MapSetExternalSourceConceptListComponent,
    MapSetUnmappedConceptListComponent,
    MapSetAssociationListComponent,
    MapSetAssociationDrawerComponent,
    MapSetPropertyValuesComponent,
    MapSetPropertyValueInputComponent
  ],
  exports: [MapSetScopeFormComponent],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}
