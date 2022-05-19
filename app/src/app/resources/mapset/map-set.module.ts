import {NgModule} from '@angular/core';
import {MapSetListComponent} from './containers/map-set-list.component';
import {SharedModule} from '../../shared/shared.module';
import {MapSetLibModule} from 'terminology-lib/resources/mapset';
import {Routes} from '@angular/router';
import {MapSetService} from './services/map-set-service';
import {MapSetEditComponent} from './containers/edit/map-set-edit.component';
import {MapSetFormComponent} from './containers/edit/map-set-form.component';


export const MAP_SET_ROUTES: Routes = [
  {path: 'add', component: MapSetEditComponent},
  {path: ':id/edit', component: MapSetEditComponent},
];

@NgModule({
  imports: [
    SharedModule,
    MapSetLibModule
  ],
  exports: [
    MapSetListComponent
  ],
  declarations: [
    MapSetListComponent,
    MapSetEditComponent,
    MapSetFormComponent
  ],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}