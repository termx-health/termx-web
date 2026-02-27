import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {TranslateModule} from '@ngx-translate/core';
import {ProvenanceListComponent} from 'term-web/sys/_lib/provenance/components/provenance-list.component';
import {ProvenanceLibService} from 'term-web/sys/_lib/provenance/services/provenance-lib.service';

@NgModule({
    imports: [
        MarinaComponentsModule,
        FormsModule,
        CommonModule,
        CoreUtilModule,
        TranslateModule,
        ProvenanceListComponent
    ],
    providers: [
        ProvenanceLibService,
    ],
    exports: [ProvenanceListComponent]
})
export class ProvenanceLibModule {
}
