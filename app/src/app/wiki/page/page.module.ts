import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {WikiLibModule} from '../_lib';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Routes} from '@angular/router';
import {WikiPageComponent} from './containers/wiki-page.component';
import {WikiPageEditComponent} from './containers/wiki-page-edit.component';
import {WikiPageSetupModalComponent} from './components/wiki-page-setup-modal.component';
import {WikiPageHeaderComponent} from './components/wiki-page-header.component';
import {WikiPageTreeComponent} from './components/wiki-page-tree.component';
import {PageService} from './services/page.service';
import {PageLinkService} from './services/page-link.service';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {WikiPageDetailsComponent} from './containers/wiki-page-details.component';
import {WikiSpaceOverviewComponent} from './components/wiki-space-overview.component';
import {PageCommentService} from './services/page-comment.service';
import {WikiPageCommentsComponent} from './components/wiki-page-comments.component';
import {WikiPageCommentComponent} from 'term-web/wiki/page/components/wiki-page-comment.component';


export const WIKI_PAGE_ROUTES: Routes = [
  {path: ':slug', component: WikiPageComponent},
  {path: ':slug/edit', component: WikiPageEditComponent, data: {privilege: ['*.Wiki.edit']}},
  {path: '', component: WikiPageComponent},
];


@NgModule({
  imports: [
    CoreUiModule,
    WikiLibModule,
    IntegrationLibModule,
    MarinaQuillModule,

    DragDropModule,
  ],
  declarations: [
    // containers
    WikiPageComponent,
    WikiPageDetailsComponent,
    WikiPageEditComponent,

    // components
    WikiPageTreeComponent,
    WikiPageSetupModalComponent,
    WikiPageHeaderComponent,
    WikiPageCommentComponent,
    WikiPageCommentsComponent,
    WikiSpaceOverviewComponent
  ],
  providers: [
    PageService,
    PageLinkService,
    PageCommentService
  ]
})
export class PageModule {
}
