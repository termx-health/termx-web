import {NgModule} from '@angular/core';
import {MapSetListComponent} from './containers/map-set-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {Routes} from '@angular/router';
import {MapSetService} from './services/map-set-service';
import {MapSetEditComponent} from './containers/edit/map-set-edit.component';
import {MapSetVersionsListComponent} from './containers/edit/map-set-versions-list.component';
import {MapSetVersionEditComponent} from './containers/version/map-set-version-edit.component';
import {MapSetVersionViewComponent} from './containers/version/map-set-version-view.component';
import {MapSetAssociationListComponent} from './containers/edit/map-set-association-list.component';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {MapSetAssociationEditComponent} from './containers/association/map-set-association-edit.component';
import {MapSetVersionEntityVersionTableComponent} from './containers/version/map-set-version-entity-version-table.component';


export const MAP_SET_ROUTES: Routes = [
  {path: 'add', component: MapSetEditComponent},
  {path: ':id/edit', component: MapSetEditComponent},
  {path: ':id/versions/add', component: MapSetVersionEditComponent},
  {path: ':id/versions/:versionId/edit', component: MapSetVersionEditComponent},
  {path: ':id/versions/:versionId/view', component: MapSetVersionViewComponent},
  {path: ':id/associations/add', component: MapSetAssociationEditComponent},
  {path: ':id/associations/:associationId/edit', component: MapSetAssociationEditComponent},
];

@NgModule({
  imports: [
    SharedModule,
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
    MapSetVersionEntityVersionTableComponent
  ],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}
