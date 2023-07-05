import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {PortalModule} from '@angular/cdk/portal';
import {TemplateService} from './services/template.service';
import {TemplateListComponent} from './containers/template/template-list.component';
import {TemplateEditComponent} from './containers/template/template-edit.component';
import {ThesaurusLibModule} from 'term-web/thesaurus/_lib';
import {ResourcesLibModule} from '../resources/_lib';
import {IntegrationLibModule} from '../integration/_lib';
import {PageModule, THESAURUS_PAGE_ROUTES} from 'term-web/thesaurus/containers/page/page.module';

export const THESAURUS_ROUTES: Routes = [
  {path: 'pages', children: THESAURUS_PAGE_ROUTES},
  {path: ':space/pages', children: THESAURUS_PAGE_ROUTES},
  {path: 'templates', component: TemplateListComponent},
  {path: 'templates/add', component: TemplateEditComponent, data: {privilege: ['*.Thesaurus.edit']}},
  {path: 'templates/:id/edit', component: TemplateEditComponent, data: {privilege: ['*.Thesaurus.edit']}}
];

@NgModule({
  imports: [
    CoreUiModule,
    ThesaurusLibModule,

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
export class ThesaurusModule {
}
