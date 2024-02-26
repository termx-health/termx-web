import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {ObservationDefinitionValueSelectComponent} from 'term-web/observation-definition/_lib/components/observation-definition-value-select.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ObservationDefinitionSearchComponent} from './components/observation-definition-search.component';
import {ObservationDefinitionLibService} from './services/observation-definition-lib.service';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    CoreUiModule,
    ResourcesLibModule
  ],
  declarations: [
    ObservationDefinitionSearchComponent,
    ObservationDefinitionValueSelectComponent,
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
