import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IntegrationAtcLibService} from './atc/service/integration-atc-lib.service';
import {IntegrationIcdLibService} from './icd-10/service/integration-icd-lib.service';
import {SnomedLibService} from './snomed/services/snomed-lib.service';
import {SnomedConceptNamePipe} from './snomed/pipe/snomed-concept-name-pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    IntegrationAtcLibService,
    IntegrationIcdLibService,
    SnomedLibService
  ],
  declarations: [
    SnomedConceptNamePipe
  ],
  exports: [
    SnomedConceptNamePipe
  ]
})
export class IntegrationLibModule {
}
