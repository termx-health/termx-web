import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {SequenceSelectComponent} from './components/sequence-select.component';
import {SequenceValueGeneratorComponent} from './components/sequence-value-generator.component';
import {SequenceLibService} from './services/sequence-lib.service';

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
