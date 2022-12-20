import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IntegrationAtcLibService} from './atc/service/integration-atc-lib.service';
import {IntegrationIcdLibService} from './icd-10/service/integration-icd-lib.service';
import {SnomedLibService} from './snomed/services/snomed-lib.service';
import {SnomedConceptNamePipe} from './snomed/pipe/snomed-concept-name-pipe';
import {IntegrationOrphanetLibService} from './orphanet/service/integration-orphanet-lib.service';
import {SnomedSearchComponent} from './snomed/containers/snomed-search.component';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../app/src/app/core/shared/shared.module';
import {ChefService} from './chef/services/chef.service';
import {FhirToFshPipe} from './chef/pipe/fhir-to-fsh-pipe';
import {FshToFhirPipe} from './chef/pipe/fsh-to-fhir-pipe';
import {IntegrationIchiLibService} from './ichi/service/integration-ichi-lib.service';

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
    IntegrationIchiLibService,
    SnomedLibService,
    ChefService
  ],
  declarations: [
    SnomedConceptNamePipe,
    SnomedSearchComponent,

    FhirToFshPipe,
    FshToFhirPipe
  ],
  exports: [
    SnomedConceptNamePipe,
    SnomedSearchComponent,

    FhirToFshPipe,
    FshToFhirPipe
  ]
})
export class IntegrationLibModule {
}
