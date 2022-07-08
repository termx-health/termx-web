import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapSetLibService} from './services/map-set-lib.service';
import {MapSetSearchComponent} from './containers/map-set-search.component';
import {MuiComponentsModule} from '@kodality-health/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MapSetEntityVersionSearchComponent} from './containers/map-set-entity-version-search.component';
import {MapSetEntityVersionLibService} from './services/map-set-entity-version-lib.service';


@NgModule({
  imports: [
    MuiComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    MapSetLibService,
    MapSetEntityVersionLibService
  ],
  declarations: [
    MapSetSearchComponent,
    MapSetEntityVersionSearchComponent,
  ],
  exports: [
    MapSetSearchComponent,
    MapSetEntityVersionSearchComponent
  ]
})
export class MapSetLibModule {
}
