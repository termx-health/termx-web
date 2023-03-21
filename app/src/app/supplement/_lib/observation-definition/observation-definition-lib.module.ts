import {NgModule} from '@angular/core';
import {ObservationDefinitionLibService} from './services/observation-definition-lib.service';
import {ObservationDefinitionSelectComponent} from './components/observation-definition-select.component';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule
  ],
  declarations: [
    ObservationDefinitionSelectComponent
  ],
  exports: [
    ObservationDefinitionSelectComponent
  ],
  providers: [
    ObservationDefinitionLibService
  ]
})
export class ObservationDefinitionLibModule {
}
