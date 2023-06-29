import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {PortalModule} from '@angular/cdk/portal';
import {StructureDefinitionListComponent} from './containers/structure-definition/containers/structure-definition-list.component';
import {StructureDefinitionEditComponent} from './containers/structure-definition/containers/structure-definition-edit.component';
import {TemplateService} from './services/template.service';
import {TemplateListComponent} from './containers/template/template-list.component';
import {TemplateEditComponent} from './containers/template/template-edit.component';
import {StructureDefinitionTypeListComponent} from './containers/structure-definition/components/structure-definition-type-list.component';
import {StructureDefinitionConstraintListComponent} from './containers/structure-definition/components/structure-definition-constraint-list.component';
import {ThesaurusLibModule} from 'term-web/thesaurus/_lib';
import {ResourcesLibModule} from '../resources/_lib';
import {IntegrationLibModule} from '../integration/_lib';
import {PageModule, THESAURUS_PAGE_ROUTES} from 'term-web/thesaurus/containers/page/page.module';
import {StructureDefinitionService} from 'term-web/thesaurus/containers/structure-definition/services/structure-definition.service';

export const THESAURUS_ROUTES: Routes = [
  {path: 'pages', children: THESAURUS_PAGE_ROUTES},
  {path: ':space/pages', children: THESAURUS_PAGE_ROUTES},
  {path: 'structure-definitions', component: StructureDefinitionListComponent},
  {path: 'structure-definitions/add', component: StructureDefinitionEditComponent, data: {privilege: ['*.Thesaurus.edit']}},
  {path: 'structure-definitions/:id/edit', component: StructureDefinitionEditComponent, data: {privilege: ['*.Thesaurus.edit']}},
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
    StructureDefinitionListComponent,
    StructureDefinitionEditComponent,
    StructureDefinitionTypeListComponent,
    StructureDefinitionConstraintListComponent,

    TemplateListComponent,
    TemplateEditComponent,
  ],
  providers: [
    StructureDefinitionService,
    TemplateService
  ]
})
export class ThesaurusModule {
}
