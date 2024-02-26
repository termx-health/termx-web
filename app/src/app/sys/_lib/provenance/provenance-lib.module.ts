import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {TranslateModule} from '@ngx-translate/core';
import {ProvenanceListComponent} from './components/provenance-list.component';
import {ProvenanceLibService} from './services/provenance-lib.service';

@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule,
    TranslateModule
  ],
  providers: [
    ProvenanceLibService,
  ],
  declarations: [ProvenanceListComponent],
  exports: [ProvenanceListComponent]
})
export class ProvenanceLibModule {
}
