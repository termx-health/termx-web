import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {TranslateModule} from '@ngx-translate/core';
import {SnomedDrawerSearchComponent} from 'term-web/integration/_lib/snomed/containers/snomed-drawer-search.component';
import {SnomedTranslationLibService} from 'term-web/integration/_lib/snomed/services/snomed-translation-lib.service';
import {IntegrationAtcLibService} from './atc/service/integration-atc-lib.service';
import {FhirToFshPipe} from './chef/pipe/fhir-to-fsh-pipe';
import {FshToFhirPipe} from './chef/pipe/fsh-to-fhir-pipe';
import {ChefService} from './chef/services/chef.service';
import {IntegrationIcdLibService} from './icd-10/service/integration-icd-lib.service';
import {IntegrationIchiLibService} from './ichi/service/integration-ichi-lib.service';
import {IntegrationOrphanetLibService} from './orphanet/service/integration-orphanet-lib.service';
import {SnomedSearchComponent} from './snomed/containers/snomed-search.component';
import {SnomedConceptNamePipe} from './snomed/pipe/snomed-concept-name-pipe';
import {SnomedLibService} from './snomed/services/snomed-lib.service';

@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    TranslateModule,
    RouterModule
  ],
  providers: [
    IntegrationAtcLibService,
    IntegrationIcdLibService,
    IntegrationOrphanetLibService,
    IntegrationIchiLibService,
    SnomedLibService,
    SnomedTranslationLibService,
    ChefService,
  ],
  declarations: [
    SnomedConceptNamePipe,
    SnomedSearchComponent,
    SnomedDrawerSearchComponent,

    FhirToFshPipe,
    FshToFhirPipe
  ],
  exports: [
    SnomedConceptNamePipe,
    SnomedSearchComponent,
    SnomedDrawerSearchComponent,

    FhirToFshPipe,
    FshToFhirPipe
  ]
})
export class IntegrationLibModule {
}
