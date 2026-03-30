import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslateModule} from '@ngx-translate/core';
import {SpaceDrawerSearchComponent} from './containers/space-drawer-search.component';
import {SpaceSelectComponent} from './containers/space-select.component';
import {PackageLibService} from './services/package-lib-service';
import {PackageResourceLibService} from './services/package-resource-lib-service';
import {SpaceLibService} from './services/space-lib-service';
import {ServerLibService} from './services/server-lib-service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MarinaComponentsModule,
        MarinaUtilModule,
        CoreUtilModule,
        TranslateModule,
        SpaceDrawerSearchComponent,
        SpaceSelectComponent
    ],
    exports: [
        SpaceDrawerSearchComponent,
        SpaceSelectComponent
    ],
    providers: [
        SpaceLibService,
        PackageLibService,
        PackageResourceLibService,
        ServerLibService
    ]
})
export class SpaceLibModule {
}
