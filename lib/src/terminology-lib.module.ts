import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources/resources-lib.module';
import {IntegrationLibModule} from './integration/integration-lib.module';
import {JobLibModule} from './job/job-lib.module';
import {MarinaUiModule} from '@kodality-health/marina-ui';

@NgModule({
  imports: [
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    MarinaUiModule
  ],
  exports: [
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule
  ]
})
export class TerminologyLibModule {
}


