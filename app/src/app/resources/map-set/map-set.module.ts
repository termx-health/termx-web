import {NgModule} from '@angular/core';
import {MapSetListComponent} from './containers/map-set-list.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {MapSetService} from './services/map-set-service';
import {MapSetEditComponent} from './containers/edit/map-set-edit.component';
import {MapSetVersionsListComponent} from './containers/edit/map-set-versions-list.component';
import {MapSetVersionEditComponent} from './containers/version/map-set-version-edit.component';
import {MapSetVersionViewComponent} from './containers/version/map-set-version-view.component';
import {MapSetAssociationListComponent} from './containers/edit/map-set-association-list.component';
import {MapSetAssociationEditComponent} from './containers/association/map-set-association-edit.component';
import {MapSetVersionEntityVersionTableComponent} from './containers/version/map-set-version-entity-version-table.component';
import {MapSetViewComponent} from './containers/edit/map-set-view.component';
import {MapSetAssociationViewComponent} from './containers/association/map-set-association-view.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';


export const MAP_SET_ROUTES: Routes = [
  {path: '', component: MapSetListComponent},
  {path: 'add', component: MapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/edit', component: MapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/view', component: MapSetViewComponent},
  {path: ':id/versions/add', component: MapSetVersionEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/versions/:versionId/edit', component: MapSetVersionEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/versions/:versionId/view', component: MapSetVersionViewComponent},
  {path: ':id/associations/add', component: MapSetAssociationEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/associations/:associationId/edit', component: MapSetAssociationEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: ':id/associations/:associationId/view', component: MapSetAssociationViewComponent}
];

@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule
  ],
  exports: [
    MapSetListComponent
  ],
  declarations: [
    MapSetListComponent,
    MapSetEditComponent,
    MapSetVersionsListComponent,
    MapSetVersionEditComponent,
    MapSetVersionViewComponent,
    MapSetAssociationListComponent,
    MapSetAssociationEditComponent,
    MapSetVersionEntityVersionTableComponent,
    MapSetViewComponent,
    MapSetAssociationViewComponent
  ],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}
