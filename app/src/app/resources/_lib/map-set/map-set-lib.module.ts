import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslateModule} from '@ngx-translate/core';
import {MapSetFileImportService} from 'term-web/resources/_lib/map-set/services/map-set-file-import.service';
import {MapSetSearchComponent} from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import {MapSetVersionSelectComponent} from 'term-web/resources/_lib/map-set/containers/map-set-version-select.component';
import {MapSetWidgetComponent} from 'term-web/resources/_lib/map-set/containers/map-set-widget.component';
import {MapSetLibService} from 'term-web/resources/_lib/map-set/services/map-set-lib.service';
import {MapSetVersionLibService} from 'term-web/resources/_lib/map-set/services/map-set-version-lib.service';


@NgModule({
    imports: [
        MarinaComponentsModule,
        FormsModule,
        CommonModule,
        CoreUtilModule,
        MarinaUtilModule,
        RouterModule,
        TranslateModule,
        MapSetSearchComponent,
        MapSetWidgetComponent,
        MapSetVersionSelectComponent
    ],
    providers: [
        MapSetLibService,
        MapSetVersionLibService,
        MapSetFileImportService
    ],
    exports: [
        MapSetSearchComponent,
        MapSetWidgetComponent,
        MapSetVersionSelectComponent
    ]
})
export class MapSetLibModule {
}
