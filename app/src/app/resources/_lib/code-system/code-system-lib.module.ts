import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaUiModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslateModule} from '@ngx-translate/core';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {CodeSystemConceptMatrixComponent} from 'term-web/resources/_lib/code-system/containers/code-system-concept-matrix.component';
import {ConceptDrawerSearchComponent} from 'term-web/resources/_lib/code-system/containers/concept-drawer-search.component';
import {CodeSystemFileImportService} from 'term-web/resources/_lib/code-system/services/code-system-file-import.service';
import {CodeSystemEntityVersionSearchComponent} from 'term-web/resources/_lib/code-system/containers/code-system-entity-version-search.component';
import {CodeSystemSearchComponent} from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import {CodeSystemVersionSelectComponent} from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import {CodeSystemWidgetComponent} from 'term-web/resources/_lib/code-system/containers/code-system-widget.component';
import {ConceptSearchComponent} from 'term-web/resources/_lib/code-system/containers/concept-search.component';
import {EntityPropertyNamePipe} from 'term-web/resources/_lib/code-system/pipe/entity-propertye-name-pipe';
import {LocalizedConceptNamePipe} from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import {CodeSystemConceptLibService} from 'term-web/resources/_lib/code-system/services/code-system-concept-lib.service';
import {CodeSystemEntityVersionLibService} from 'term-web/resources/_lib/code-system/services/code-system-entity-version-lib.service';
import {CodeSystemLibService} from 'term-web/resources/_lib/code-system/services/code-system-lib.service';
import {CodeSystemVersionLibService} from 'term-web/resources/_lib/code-system/services/code-system-version-lib.service';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        MarinaUiModule,
        FormsModule,
        CoreUtilModule,
        TranslateModule,
        MarinaUtilModule,
        IntegrationLibModule,
        CodeSystemSearchComponent,
        ConceptSearchComponent,
        ConceptDrawerSearchComponent,
        CodeSystemVersionSelectComponent,
        CodeSystemEntityVersionSearchComponent,
        CodeSystemWidgetComponent,
        CodeSystemConceptMatrixComponent,
        LocalizedConceptNamePipe,
        EntityPropertyNamePipe
    ],
    providers: [
        CodeSystemLibService,
        CodeSystemEntityVersionLibService,
        CodeSystemFileImportService,
        CodeSystemConceptLibService,
        CodeSystemVersionLibService
    ],
    exports: [
        CodeSystemSearchComponent,
        ConceptSearchComponent,
        ConceptDrawerSearchComponent,
        CodeSystemVersionSelectComponent,
        CodeSystemEntityVersionSearchComponent,
        CodeSystemWidgetComponent,
        CodeSystemConceptMatrixComponent,
        LocalizedConceptNamePipe,
        EntityPropertyNamePipe,
    ]
})
export class CodeSystemLibModule {
}
