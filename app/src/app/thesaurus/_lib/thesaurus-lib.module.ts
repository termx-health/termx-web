import {NgModule} from '@angular/core';
import {PageLibService} from './services/page-lib.service';
import {PageSelectComponent} from './containers/page-select.component';
import {StructureDefinitionLibService} from './services/structure-definition-lib.service';
import {TagLibService} from './services/tag-lib.service';
import {TemplateLibService} from './services/template-lib.service';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {NgForOf} from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    CoreUtilModule,
    NgForOf,
  ],
  providers: [
    TagLibService,
    PageLibService,
    TemplateLibService,
    StructureDefinitionLibService
  ],
  declarations: [
    PageSelectComponent
  ],
  exports: [
    PageSelectComponent
  ]
})
export class ThesaurusLibModule {
}
