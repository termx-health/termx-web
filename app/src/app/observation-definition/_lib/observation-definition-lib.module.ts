import {NgModule} from '@angular/core';
import {ObservationDefinitionLibService} from './services/observation-definition-lib.service';
import {ObservationDefinitionSearchComponent} from './components/observation-definition-search.component';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {SharedModule} from '../../core/shared/shared.module';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    SharedModule
  ],
  declarations: [
    ObservationDefinitionSearchComponent
  ],
  exports: [
    ObservationDefinitionSearchComponent
  ],
  providers: [
    ObservationDefinitionLibService
  ]
})
export class ObservationDefinitionLibModule {
}
