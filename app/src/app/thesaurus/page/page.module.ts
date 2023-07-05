import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ThesaurusLibModule} from '../_lib';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Routes} from '@angular/router';
import {ThesaurusPageComponent} from './containers/thesaurus-page.component';
import {ThesaurusPageEditComponent} from './containers/thesaurus-page-edit.component';
import {ThesaurusPageModalComponent} from './components/thesaurus-page-modal.component';
import {ThesaurusPageHeaderComponent} from './components/thesaurus-page-header.component';
import {ThesaurusSidebarComponent} from './components/thesaurus-sidebar.component';
import {PageService} from './services/page.service';
import {PageLinkService} from './services/page-link.service';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {ThesaurusPageDetailsComponent} from './components/thesaurus-page-details.component';
import {ThesaurusSpaceOverviewComponent} from './components/thesaurus-space-overview.component';


export const THESAURUS_PAGE_ROUTES: Routes = [
  {path: '', component: ThesaurusPageComponent},
  {path: ':slug', component: ThesaurusPageComponent},
  {path: ':slug/edit', component: ThesaurusPageEditComponent, data: {privilege: ['*.Thesaurus.edit']}},
];


@NgModule({
  imports: [
    CoreUiModule,
    ThesaurusLibModule,
    IntegrationLibModule,
    MarinaMarkdownModule,
    MarinaQuillModule,

    DragDropModule,
  ],
  declarations: [
    // containers
    ThesaurusPageComponent,
    ThesaurusPageEditComponent,

    // components
    ThesaurusSidebarComponent,
    ThesaurusPageModalComponent,
    ThesaurusPageHeaderComponent,
    ThesaurusPageDetailsComponent,
    ThesaurusSpaceOverviewComponent
  ],
  providers: [
    PageService,
    PageLinkService,
  ]
})
export class PageModule {
}
