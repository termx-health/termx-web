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
import {ChefService} from './chef/services/chef.service';
import {FhirToFshPipe} from './chef/pipe/fhir-to-fsh-pipe';
import {FshToFhirPipe} from './chef/pipe/fsh-to-fhir-pipe';
import {IntegrationIchiLibService} from './ichi/service/integration-ichi-lib.service';
import {RouterModule} from '@angular/router';
import {SnomedDrawerSearchComponent} from 'term-web/integration/_lib/snomed/containers/snomed-drawer-search.component';
import {SnomedTranslationLibService} from 'term-web/integration/_lib/snomed/services/snomed-translation-lib.service';

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
