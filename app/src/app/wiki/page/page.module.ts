import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {WikiLibModule} from '../_lib';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Routes} from '@angular/router';
import {WikiPageComponent} from './containers/wiki-page.component';
import {WikiPageEditComponent} from './containers/wiki-page-edit.component';
import {WikiPageModalComponent} from './components/wiki-page-modal.component';
import {WikiPageHeaderComponent} from './components/wiki-page-header.component';
import {WikiSidebarComponent} from './components/wiki-sidebar.component';
import {PageService} from './services/page.service';
import {PageLinkService} from './services/page-link.service';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {WikiPageDetailsComponent} from './components/wiki-page-details.component';
import {WikiSpaceDetailsComponent} from './components/wiki-space-details.component';


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
    WikiPageEditComponent,

    // components
    WikiSidebarComponent,
    WikiPageModalComponent,
    WikiPageHeaderComponent,
    WikiPageDetailsComponent,
    WikiSpaceDetailsComponent
  ],
  providers: [
    PageService,
    PageLinkService,
  ]
})
export class PageModule {
}
