import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {MeasurementUnitSearchComponent} from 'term-web/measurement-unit/_lib/containers/measurement-unit-search.component';
import {MeasurementUnitLibService} from 'term-web/measurement-unit/_lib/services/measurement-unit-lib.service';

@NgModule({
    imports: [
        FormsModule,
        MarinaComponentsModule,
        MarinaUtilModule,
        CoreUtilModule,
        CommonModule,
        MeasurementUnitSearchComponent,
    ],
    exports: [
        MeasurementUnitSearchComponent
    ],
    providers: [
        MeasurementUnitLibService
    ]
})
export class MeasurementUnitLibModule {
}
