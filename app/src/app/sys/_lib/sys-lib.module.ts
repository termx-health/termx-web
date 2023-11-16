import {NgModule} from '@angular/core';
import {JobLibService} from './services/job-lib.service';
import {LorqueLibService} from './services/lorque-lib.service';
import {ProvenanceLibService} from './services/provenance-lib.service';
import {ProvenanceListComponent} from './components/provenance-list.component';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {TranslateModule} from '@ngx-translate/core';
import {CoreUtilModule} from '@kodality-web/core-util';
import {JsonPipe} from '@angular/common';

@NgModule({
  imports: [
    MarinaUiModule,
    TranslateModule,
    CoreUtilModule,
    JsonPipe
  ],
  declarations: [ProvenanceListComponent],
  exports: [ProvenanceListComponent],
  providers: [
    JobLibService,
    LorqueLibService,
    ProvenanceLibService
  ]
})
export class SysLibModule {
}
