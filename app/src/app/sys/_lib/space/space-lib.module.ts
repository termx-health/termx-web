import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslateModule} from '@ngx-translate/core';
import {SpaceDrawerSearchComponent} from 'term-web/sys/_lib/space/containers/space-drawer-search.component';
import {SpaceSelectComponent} from 'term-web/sys/_lib/space/containers/space-select.component';
import {PackageLibService} from 'term-web/sys/_lib/space/services/package-lib-service';
import {PackageResourceLibService} from 'term-web/sys/_lib/space/services/package-resource-lib-service';
import {SpaceLibService} from 'term-web/sys/_lib/space/services/space-lib-service';
import {TerminologyServerLibService} from 'term-web/sys/_lib/space/services/terminology-server-lib-service';

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
        TerminologyServerLibService
    ]
})
export class SpaceLibModule {
}
