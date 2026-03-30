import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaUiModule} from '@termx-health/ui';
import {SequenceSelectComponent} from 'term-web/sequence/_lib/components/sequence-select.component';
import {SequenceValueGeneratorComponent} from 'term-web/sequence/_lib/components/sequence-value-generator.component';
import {SequenceLibService} from 'term-web/sequence/_lib/services/sequence-lib.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MarinaUiModule,
        CoreUtilModule,
        SequenceSelectComponent,
        SequenceValueGeneratorComponent
    ],
    exports: [
        SequenceSelectComponent,
        SequenceValueGeneratorComponent
    ],
    providers: [
        SequenceLibService
    ]
})
export class SequenceLibModule {
}
