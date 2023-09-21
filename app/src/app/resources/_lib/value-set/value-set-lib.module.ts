import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ValueSetLibService} from './services/value-set-lib.service';
import {ValueSetSearchComponent} from './containers/value-set-search.component';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {ValueSetVersionSelectComponent} from './containers/value-set-version-select.component';
import {ValueSetConceptSelectComponent} from './containers/value-set-concept-select.component';
import {CodeSystemLibModule} from '../code-system';
import {ValueSetVersionLibService} from './services/value-set-version-lib.service';
import {ValueSetVersionCodePipe} from './pipe/value-set-version-code-pipe';
import {ValueSetWidgetComponent} from './containers/value-set-widget.component';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {RouterModule} from '@angular/router';
import {ValueSetFileImportService} from 'term-web/resources/_lib/value-set/services/value-set-file-import.service';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    CodeSystemLibModule,
    MarinaUtilModule,
    RouterModule
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

    ValueSetVersionCodePipe
  ],
  exports: [
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent,
    ValueSetConceptSelectComponent,
    ValueSetWidgetComponent,

    ValueSetVersionCodePipe
  ]
})
export class ValueSetLibModule {
}
