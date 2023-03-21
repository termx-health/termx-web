import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapSetLibService} from './services/map-set-lib.service';
import {MapSetSearchComponent} from './containers/map-set-search.component';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MapSetEntityVersionSearchComponent} from './containers/map-set-entity-version-search.component';
import {MapSetEntityVersionLibService} from './services/map-set-entity-version-lib.service';
import {MapSetWidgetComponent} from './containers/map-set-widget.component';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {RouterModule} from '@angular/router';


@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule,
    MarinaUtilModule,
    RouterModule
  ],
  providers: [
    MapSetLibService,
    MapSetEntityVersionLibService
  ],
  declarations: [
    MapSetSearchComponent,
    MapSetEntityVersionSearchComponent,
    MapSetWidgetComponent
  ],
  exports: [
    MapSetSearchComponent,
    MapSetEntityVersionSearchComponent,
    MapSetWidgetComponent
  ]
})
export class MapSetLibModule {
}
