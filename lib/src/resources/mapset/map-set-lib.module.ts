import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapSetLibService} from './services/map-set-lib.service';
import {MapSetSearchComponent} from './containers/map-set-search.component';
import {MuiComponentsModule} from '@kodality-health/marina-ui';
import {CorePipesModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    MuiComponentsModule,
    CorePipesModule,
    FormsModule
  ],
  providers: [
    MapSetLibService
  ],
  declarations: [
    MapSetSearchComponent
  ],
  exports: [
    MapSetSearchComponent
  ]
})
export class MapSetLibModule {
}
