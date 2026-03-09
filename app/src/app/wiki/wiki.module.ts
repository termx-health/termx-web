import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {PageModule, WIKI_PAGE_ROUTES} from 'term-web/wiki/page/page.module';
import {TemplateEditComponent} from 'term-web/wiki/template/template-edit.component';
import {TemplateListComponent} from 'term-web/wiki/template/template-list.component';
import {TemplateService} from 'term-web/wiki/template/template.service';

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
        TemplateListComponent,
        TemplateEditComponent,
    ],
    providers: [
        TemplateService
    ]
})
export class WikiModule {
}
