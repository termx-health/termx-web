import {NgModule} from '@angular/core';
import {SequenceLibService} from './services/sequence-lib.service';
import {SequenceSelectComponent} from './components/sequence-select.component';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {CommonModule} from '@angular/common';
import {SequenceValueGeneratorComponent} from './components/sequence-value-generator.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MarinaUiModule,
    CoreUtilModule
  ],
  declarations: [
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
