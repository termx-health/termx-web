import {NgModule} from '@angular/core';
import {MapSetListComponent} from './containers/map-set-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {MapSetLibModule} from 'terminology-lib/resources/mapset';
import {Routes} from '@angular/router';
import {MapSetService} from './services/map-set-service';
import {MapSetEditComponent} from './containers/edit/map-set-edit.component';
import {MapSetFormComponent} from './containers/edit/map-set-form.component';
import {MapSetVersionsListComponent} from './containers/edit/map-set-versions-list.component';
import {MapSetVersionEditComponent} from './containers/version/map-set-version-edit.component';
import {MapSetVersionViewComponent} from './containers/version/map-set-version-view.component';
import {MapSetAssociationListComponent} from './containers/edit/map-set-association-list.component';
import {CodeSystemLibModule, ValueSetLibModule} from 'terminology-lib/resources';


export const MAP_SET_ROUTES: Routes = [
  {path: 'add', component: MapSetEditComponent},
  {path: ':id/edit', component: MapSetEditComponent},
  {path: ':id/versions/add', component: MapSetVersionEditComponent},
  {path: ':id/versions/:version/edit', component: MapSetVersionEditComponent},
  {path: ':id/versions/:version/view', component: MapSetVersionViewComponent},
];

@NgModule({
  imports: [
    SharedModule,
    MapSetLibModule,
    ValueSetLibModule,
    CodeSystemLibModule
  ],
  exports: [
    MapSetListComponent
  ],
  declarations: [
    MapSetListComponent,
    MapSetEditComponent,
    MapSetFormComponent,
    MapSetVersionsListComponent,
    MapSetVersionEditComponent,
    MapSetVersionViewComponent,
    MapSetAssociationListComponent
  ],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}
