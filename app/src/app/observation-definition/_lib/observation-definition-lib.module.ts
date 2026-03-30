import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@termx-health/ui';
import {ObservationDefinitionValueSelectComponent} from 'term-web/observation-definition/_lib/components/observation-definition-value-select.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {ObservationDefinitionSearchComponent} from 'term-web/observation-definition/_lib/components/observation-definition-search.component';
import {ObservationDefinitionLibService} from 'term-web/observation-definition/_lib/services/observation-definition-lib.service';

@NgModule({
    imports: [
        FormsModule,
        MarinaComponentsModule,
        CoreUiModule,
        ResourcesLibModule,
        ObservationDefinitionSearchComponent,
        ObservationDefinitionValueSelectComponent
    ],
    exports: [
        ObservationDefinitionSearchComponent,
        ObservationDefinitionValueSelectComponent,
    ],
    providers: [
        ObservationDefinitionLibService
    ]
})
export class ObservationDefinitionLibModule {
}
