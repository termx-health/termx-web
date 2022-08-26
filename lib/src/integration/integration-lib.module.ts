import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IntegrationAtcLibService} from './atc/service/integration-atc-lib.service';
import {IntegrationIcdLibService} from './icd-10/service/integration-icd-lib.service';
import {SnomedLibService} from './snomed/services/snomed-lib.service';
import {SnomedConceptNamePipe} from './snomed/pipe/snomed-concept-name-pipe';
import {IntegrationOrphanetLibService} from './orphanet/service/integration-orphanet-lib.service';
import {SnomedSearchComponent} from './snomed/containers/snomed-search.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../app/src/app/core/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    TranslateModule,
    SharedModule
  ],
  providers: [
    IntegrationAtcLibService,
    IntegrationIcdLibService,
    IntegrationOrphanetLibService,
    SnomedLibService
  ],
  declarations: [
    SnomedConceptNamePipe,
    SnomedSearchComponent
  ],
  exports: [
    SnomedConceptNamePipe,
    SnomedSearchComponent
  ]
})
export class IntegrationLibModule {
}
