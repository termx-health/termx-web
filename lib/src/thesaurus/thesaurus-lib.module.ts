import {NgModule} from '@angular/core';
import {ThesaurusLibService} from './services/thesaurus-lib.service';
import {PageSelectComponent} from './containers/page-select.component';
import {SharedModule} from '../../../app/src/app/core/shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [
    ThesaurusLibService
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
