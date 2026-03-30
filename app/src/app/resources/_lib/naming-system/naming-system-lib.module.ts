import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {NamingSystemSearchComponent} from 'term-web/resources/_lib/naming-system/containers/naming-system-search.component';
import {NamingSystemLibService} from 'term-web/resources/_lib/naming-system/services/naming-system-lib.service';

@NgModule({
    imports: [
        MarinaComponentsModule,
        FormsModule,
        CommonModule,
        CoreUtilModule,
        NamingSystemSearchComponent
    ],
    providers: [
        NamingSystemLibService
    ],
    exports: [
        NamingSystemSearchComponent
    ]
})

export class NamingSystemLibModule {
}
