import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaUiModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslateModule} from '@ngx-translate/core';
import {AuthModule} from 'term-web/core/auth';
import {SpaceLibModule} from 'term-web/sys/_lib/space';
import {SpaceModule} from 'term-web/sys/space/space.module';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        MarinaUiModule,
        MarinaUtilModule,
        CoreUtilModule,
        SpaceModule,
        SpaceLibModule,
        AuthModule,
        SpaceContextComponent
    ],
    exports: [
        SpaceContextComponent
    ]
})
export class SpaceContextModule {
}
