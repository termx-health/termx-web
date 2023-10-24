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
import {WikiPageCommentComponent} from './components/wiki-page-comment.component';
import {WikiSpaceService} from './services/wiki-space.service';
import {WikiPageHistoryComponent} from './containers/wiki-page-history.component';
import {unsavedChangesGuard} from 'term-web/core/ui/guard/unsaved-changes.guard';


export const WIKI_PAGE_ROUTES: Routes = [
  {path: ':slug', component: WikiPageComponent},
  {path: ':slug/edit', component: WikiPageEditComponent, data: {privilege: ['*.Wiki.edit']}, canDeactivate: [unsavedChangesGuard]},
  {path: ':slug/history', component: WikiPageHistoryComponent},
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
    WikiPageHistoryComponent,

    // components
    WikiPageTreeComponent,
    WikiPageSetupModalComponent,
    WikiPageHeaderComponent,
    WikiPageCommentComponent,
    WikiPageCommentsComponent,
    WikiSpaceOverviewComponent
  ],
  providers: [
    WikiSpaceService,
    PageService,
    PageLinkService,
    PageCommentService
  ]
})
export class PageModule {
}
