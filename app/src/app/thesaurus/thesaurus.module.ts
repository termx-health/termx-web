import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SharedModule} from '../core/shared/shared.module';
import {ThesaurusSidebarComponent} from './containers/thesaurus-sidebar.component';
import {ThesaurusService} from './services/thesaurus.service';
import {ThesaurusPageComponent} from './containers/thesaurus-page.component';
import {ThesaurusPageEditComponent} from './containers/thesaurus-page-edit.component';
import {ThesaurusLibModule} from 'terminology-lib/thesaurus';
import {ThesaurusPageModalComponent} from './containers/thesaurus-page-modal.component';
import {ThesaurusTextareaComponent} from './containers/textarea/thesaurus-textarea.component';
import {ThesaurusTextareaPopupComponent} from './containers/textarea/thesaurus-textarea-popup.component';

export const THESAURUS_ROUTES: Routes = [
  {path: '', component: ThesaurusPageComponent},
  {path: ':slug', component: ThesaurusPageComponent},
  {path: ':slug/edit', component: ThesaurusPageEditComponent}
];

@NgModule({
  imports: [
    SharedModule,
    ThesaurusLibModule
  ],
  declarations: [
    ThesaurusSidebarComponent,
    ThesaurusPageComponent,
    ThesaurusPageEditComponent,
    ThesaurusPageModalComponent,
    ThesaurusTextareaComponent,
    ThesaurusTextareaPopupComponent
  ],
  providers: [
    ThesaurusService
  ]
})
export class ThesaurusModule {
}
