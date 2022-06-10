import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources/resources-lib.module';
import {IntegrationLibModule} from './integration/integration-lib.module';
import {JobLibModule} from './job/job-lib.module';
import {StatusTagComponent} from './publication-status/status-tag/status-tag/status-tag.component';

@NgModule({
  imports: [
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule
  ],
  exports: [
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule
  ],
  declarations: [
    StatusTagComponent
  ]
})
export class TerminologyLibModule {
}


