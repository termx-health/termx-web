import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CorePipesModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {DesignationSelectComponent} from 'term-web/resources/_lib/designation/containers/designation-select/designation-select.component';
import {DesignationLibService} from 'term-web/resources/_lib/designation/services/designation-lib.service';


@NgModule({
    imports: [
        MarinaUiModule,
        CorePipesModule,
        FormsModule,
        CommonModule,
        DesignationSelectComponent
    ],
    providers: [
        DesignationLibService
    ],
    exports: [
        DesignationSelectComponent
    ]
})
export class DesignationLibModule {
}
