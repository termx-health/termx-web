import {NgModule} from '@angular/core';
import {MapSetListComponent} from './containers/map-set-list/map-set-list.component';
import {SharedModule} from '../../shared/shared.module';
import {MapSetLibModule} from 'terminology-lib/resources/mapset';
import {Routes} from '@angular/router';
import {MapSetService} from './services/map-set-service';


export const MAP_SET_ROUTES: Routes = [];

@NgModule({
  imports: [
    SharedModule,
    MapSetLibModule
  ],
  exports: [
    MapSetListComponent
  ],
  declarations: [
    MapSetListComponent
  ],
  providers: [
    MapSetService
  ]
})
export class MapSetModule {
}