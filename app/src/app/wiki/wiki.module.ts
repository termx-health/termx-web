import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {PortalModule} from '@angular/cdk/portal';
import {TemplateService} from './template/template.service';
import {TemplateListComponent} from './template/template-list.component';
import {TemplateEditComponent} from './template/template-edit.component';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {ResourcesLibModule} from '../resources/_lib';
import {IntegrationLibModule} from '../integration/_lib';
import {PageModule, WIKI_PAGE_ROUTES} from './page/page.module';

export const WIKI_ROUTES: Routes = [
  {path: ':space', children: WIKI_PAGE_ROUTES},
  {path: '', children: WIKI_PAGE_ROUTES},
];

export const WIKI_MANAGEMENT_ROUTES: Routes = [
  {path: 'templates', component: TemplateListComponent},
  {path: 'templates/add', component: TemplateEditComponent, data: {privilege: ['*.Wiki.edit']}},
  {path: 'templates/:id/edit', component: TemplateEditComponent, data: {privilege: ['*.Wiki.edit']}}
];

@NgModule({
  imports: [
    CoreUiModule,
    WikiLibModule,

    PortalModule,
    ResourcesLibModule,
    IntegrationLibModule,

    PageModule,
  ],
  declarations: [
    TemplateListComponent,
    TemplateEditComponent,
  ],
  providers: [
    TemplateService
  ]
})
export class WikiModule {
}
