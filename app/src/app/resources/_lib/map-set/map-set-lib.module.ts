import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapSetLibService} from './services/map-set-lib.service';
import {MapSetVersionLibService} from './services/map-set-version-lib.service';
import {MapSetSearchComponent} from './containers/map-set-search.component';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MapSetWidgetComponent} from './containers/map-set-widget.component';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {RouterModule} from '@angular/router';
import {MapSetFileImportService} from 'term-web/resources/_lib/map-set/services/map-set-file-import.service';


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
    MapSetVersionLibService,
    MapSetFileImportService
  ],
  declarations: [
    MapSetSearchComponent,
    MapSetWidgetComponent
  ],
  exports: [
    MapSetSearchComponent,
    MapSetWidgetComponent
  ]
})
export class MapSetLibModule {
}
