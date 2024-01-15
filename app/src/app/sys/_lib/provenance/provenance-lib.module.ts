import {NgModule} from '@angular/core';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {ProvenanceListComponent} from './components/provenance-list.component';
import {ProvenanceLibService} from './services/provenance-lib.service';
import {TranslateModule} from '@ngx-translate/core';

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
