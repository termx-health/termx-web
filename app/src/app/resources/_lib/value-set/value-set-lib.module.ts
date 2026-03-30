import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaUiModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslateModule} from '@ngx-translate/core';
import {CodeSystemLibModule} from 'term-web/resources/_lib/code-system';
import {ValueSetConceptMatrixComponent} from 'term-web/resources/_lib/value-set/containers/value-set-concept-matrix.component';
import {ValueSetConceptSelectComponent} from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import {ValueSetSearchComponent} from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import {ValueSetVersionSelectComponent} from 'term-web/resources/_lib/value-set/containers/value-set-version-select.component';
import {ValueSetWidgetComponent} from 'term-web/resources/_lib/value-set/containers/value-set-widget.component';
import {ValueSetVersionCodePipe} from 'term-web/resources/_lib/value-set/pipe/value-set-version-code-pipe';
import {ValueSetFileImportService} from 'term-web/resources/_lib/value-set/services/value-set-file-import.service';
import {ValueSetLibService} from 'term-web/resources/_lib/value-set/services/value-set-lib.service';
import {ValueSetVersionLibService} from 'term-web/resources/_lib/value-set/services/value-set-version-lib.service';


@NgModule({
    imports: [
        CommonModule,
        MarinaUiModule,
        FormsModule,
        CoreUtilModule,
        CodeSystemLibModule,
        MarinaUtilModule,
        RouterModule,
        TranslateModule,
        ValueSetSearchComponent,
        ValueSetVersionSelectComponent,
        ValueSetConceptSelectComponent,
        ValueSetWidgetComponent,
        ValueSetConceptMatrixComponent,
        ValueSetVersionCodePipe
    ],
    providers: [
        ValueSetLibService,
        ValueSetVersionLibService,
        ValueSetFileImportService
    ],
    exports: [
        ValueSetSearchComponent,
        ValueSetVersionSelectComponent,
        ValueSetConceptSelectComponent,
        ValueSetWidgetComponent,
        ValueSetConceptMatrixComponent,
        ValueSetVersionCodePipe
    ]
})
export class ValueSetLibModule {
}
