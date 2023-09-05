import {NgModule} from '@angular/core';
import {MapSetListComponent} from './containers/list/map-set-list.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {MapSetService} from './services/map-set-service';
import {MapSetEditComponent} from './containers/edit/map-set-edit.component';
import {MapSetVersionEditComponent} from './containers/version/edit/map-set-version-edit.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CodeSystemModule} from 'term-web/resources/code-system/code-system.module';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {MapSetSummaryComponent} from 'term-web/resources/map-set/containers/summary/map-set-summary.component';
import {MapSetVersionsWidgetComponent} from 'term-web/resources/map-set/containers/summary/widgets/map-set-versions-widget.component';
import {MapSetInfoWidgetComponent} from 'term-web/resources/map-set/containers/summary/widgets/map-set-info-widget.component';
import {MapSetProvenancesComponent} from 'term-web/resources/map-set/containers/provenance/map-set-provenances.component';
import {SysLibModule} from 'term-web/sys/_lib';
import {MapSetVersionProvenancesComponent} from 'term-web/resources/map-set/containers/version/provenance/map-set-version-provenances.component';
import {MapSetVersionSummaryComponent} from 'term-web/resources/map-set/containers/version/summary/map-set-version-summary.component';
import {MapSetVersionInfoWidgetComponent} from 'term-web/resources/map-set/containers/version/summary/widgets/map-set-version-info-widget.component';
import {UserLibModule} from 'term-web/user/_lib';
import {ObservationDefinitionLibModule} from 'term-web/observation-definition/_lib';
import {MapSetSourceConceptListComponent} from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-source-concept-list.component';
import {MapSetAssociationListComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-list.component';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import {MapSetUnmappedConceptListComponent} from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-unmapped-concept-list.component';
import {
  MapSetExternalSourceConceptListComponent
} from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-external-source-concept-list.component';
import {MapSetScopeFormComponent} from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';

export const MAP_SET_ROUTES: Routes = [
  {path: '', component: MapSetListComponent},
  {path: 'add', component: MapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/edit', component: MapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/summary', component: MapSetSummaryComponent},
  {path: ':id/provenances', component: MapSetProvenancesComponent},

  {path: ':id/versions/add', component: MapSetVersionEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/versions/:versionCode/summary', component: MapSetVersionSummaryComponent},
  {path: ':id/versions/:versionCode/provenances', component: MapSetVersionProvenancesComponent},
  {path: ':id/versions/:versionCode/edit', component: MapSetVersionEditComponent, data: {privilege: ['*.MapSet.edit']}},

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
    MapSetScopeFormComponent,
    MapSetSummaryComponent,
    MapSetInfoWidgetComponent,
    MapSetVersionsWidgetComponent,
    MapSetProvenancesComponent,

    MapSetVersionEditComponent,
    MapSetVersionSummaryComponent,
    MapSetVersionProvenancesComponent,
    MapSetVersionInfoWidgetComponent,
    MapSetSourceConceptListComponent,
    MapSetExternalSourceConceptListComponent,
    MapSetUnmappedConceptListComponent,
    MapSetAssociationListComponent,
    MapSetAssociationDrawerComponent
  ],
  exports: [MapSetScopeFormComponent],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}
