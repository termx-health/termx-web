import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {unsavedChangesGuard} from 'term-web/core/ui/guard/unsaved-changes.guard';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {WikiPageCommentComponent} from 'term-web/wiki/page/components/wiki-page-comment.component';
import {WikiPageCommentsComponent} from 'term-web/wiki/page/components/wiki-page-comments.component';
import {WikiPageHeaderComponent} from 'term-web/wiki/page/components/wiki-page-header.component';
import {WikiPageSetupModalComponent} from 'term-web/wiki/page/components/wiki-page-setup-modal.component';
import {WikiPageTreeComponent} from 'term-web/wiki/page/components/wiki-page-tree.component';
import {WikiSpaceOverviewComponent} from 'term-web/wiki/page/components/wiki-space-overview.component';
import {WikiPageDetailsComponent} from 'term-web/wiki/page/containers/wiki-page-details.component';
import {WikiPageEditComponent} from 'term-web/wiki/page/containers/wiki-page-edit.component';
import {WikiPageHistoryComponent} from 'term-web/wiki/page/containers/wiki-page-history.component';
import {WikiPageComponent} from 'term-web/wiki/page/containers/wiki-page.component';
import {PageCommentService} from 'term-web/wiki/page/services/page-comment.service';
import {PageLinkService} from 'term-web/wiki/page/services/page-link.service';
import {PageService} from 'term-web/wiki/page/services/page.service';
import {WikiSpaceService} from 'term-web/wiki/page/services/wiki-space.service';


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
        WikiSpaceOverviewComponent,
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
