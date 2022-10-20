import {NgModule} from '@angular/core';
import {PageLibService} from './services/page-lib.service';
import {PageSelectComponent} from './containers/page-select.component';
import {SharedModule} from '../../../app/src/app/core/shared/shared.module';
import {StructureDefinitionLibService} from './services/structure-definition-lib.service';
import {TagLibService} from './services/tag-lib.service';
import {TemplateLibService} from './services/template-lib.service';

@NgModule({
  imports: [
    SharedModule
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
