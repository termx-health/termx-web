import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SharedModule} from '../core/shared/shared.module';
import {ThesaurusSidebarComponent} from './containers/thesaurus-sidebar.component';
import {ThesaurusService} from './services/thesaurus.service';
import {ThesaurusPageComponent} from './containers/thesaurus-page.component';
import {ThesaurusPageEditComponent} from './containers/thesaurus-page-edit.component';
import {ThesaurusLibModule} from 'terminology-lib/thesaurus';
import {ThesaurusPageModalComponent} from './containers/thesaurus-page-modal.component';
import {ThesaurusTextareaComponent} from './containers/texteditor/thesaurus-textarea.component';
import {ThesaurusDropdownComponent} from './containers/texteditor/thesaurus-dropdown.component';
import {PortalModule} from '@angular/cdk/portal';
import {ThesaurusDropdownOptionComponent} from './containers/texteditor/thesaurus-dropdown-option.component';
import {ThesaurusSmartTextEditorComponent} from './containers/texteditor/thesaurus-smart-text-editor.component';
import {ThesaurusLinkModalComponent} from './containers/texteditor/thesaurus-link-modal.component';
import {ResourcesLibModule} from 'terminology-lib/resources';

export const THESAURUS_ROUTES: Routes = [
  {path: '', component: ThesaurusPageComponent},
  {path: ':slug', component: ThesaurusPageComponent},
  {path: ':slug/edit', component: ThesaurusPageEditComponent}
];

@NgModule({
  imports: [
    SharedModule,
    ThesaurusLibModule,

    PortalModule,
    ResourcesLibModule
  ],
  declarations: [
    ThesaurusSidebarComponent,
    ThesaurusPageComponent,
    ThesaurusPageEditComponent,
    ThesaurusPageModalComponent,
    ThesaurusTextareaComponent,
    ThesaurusLinkModalComponent,
    ThesaurusDropdownComponent,
    ThesaurusDropdownOptionComponent,
    ThesaurusSmartTextEditorComponent
  ],
  providers: [ThesaurusService]
})
export class ThesaurusModule {
}
