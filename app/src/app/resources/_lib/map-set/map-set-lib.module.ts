import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslateModule} from '@ngx-translate/core';
import {MapSetFileImportService} from 'term-web/resources/_lib/map-set/services/map-set-file-import.service';
import {MapSetSearchComponent} from './containers/map-set-search.component';
import {MapSetVersionSelectComponent} from './containers/map-set-version-select.component';
import {MapSetWidgetComponent} from './containers/map-set-widget.component';
import {MapSetLibService} from './services/map-set-lib.service';
import {MapSetVersionLibService} from './services/map-set-version-lib.service';


@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule,
    MarinaUtilModule,
    RouterModule,
    TranslateModule
  ],
  providers: [
    MapSetLibService,
    MapSetVersionLibService,
    MapSetFileImportService
  ],
  declarations: [
    MapSetSearchComponent,
    MapSetWidgetComponent,
    MapSetVersionSelectComponent
  ],
  exports: [
    MapSetSearchComponent,
    MapSetWidgetComponent,
    MapSetVersionSelectComponent
  ]
})
export class MapSetLibModule {
}
