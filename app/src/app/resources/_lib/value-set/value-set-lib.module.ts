import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslateModule} from '@ngx-translate/core';
import {CodeSystemLibModule} from '../code-system';
import {ValueSetConceptMatrixComponent} from './containers/value-set-concept-matrix.component';
import {ValueSetConceptSelectComponent} from './containers/value-set-concept-select.component';
import {ValueSetSearchComponent} from './containers/value-set-search.component';
import {ValueSetVersionSelectComponent} from './containers/value-set-version-select.component';
import {ValueSetWidgetComponent} from './containers/value-set-widget.component';
import {ValueSetVersionCodePipe} from './pipe/value-set-version-code-pipe';
import {ValueSetFileImportService} from './services/value-set-file-import.service';
import {ValueSetLibService} from './services/value-set-lib.service';
import {ValueSetVersionLibService} from './services/value-set-version-lib.service';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    CodeSystemLibModule,
    MarinaUtilModule,
    RouterModule,
    TranslateModule
  ],
  providers: [
    ValueSetLibService,
    ValueSetVersionLibService,
    ValueSetFileImportService
  ],
  declarations: [
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent,
    ValueSetConceptSelectComponent,
    ValueSetWidgetComponent,
    ValueSetConceptMatrixComponent,

    ValueSetVersionCodePipe
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
