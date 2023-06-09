import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ThesaurusSidebarComponent} from './containers/page/thesaurus-sidebar.component';
import {PageService} from './services/page.service';
import {ThesaurusPageComponent} from './containers/page/thesaurus-page.component';
import {ThesaurusPageEditComponent} from './containers/page/thesaurus-page-edit.component';
import {ThesaurusPageModalComponent} from './containers/page/thesaurus-page-modal.component';
import {ThesaurusTextareaComponent} from './containers/texteditor/thesaurus-textarea.component';
import {ThesaurusDropdownComponent} from './containers/texteditor/thesaurus-dropdown.component';
import {PortalModule} from '@angular/cdk/portal';
import {ThesaurusDropdownOptionComponent} from './containers/texteditor/thesaurus-dropdown-option.component';
import {ThesaurusSmartTextEditorComponent} from './containers/texteditor/thesaurus-smart-text-editor.component';
import {ThesaurusLinkModalComponent} from './containers/texteditor/link/thesaurus-link-modal.component';
import {ThesaurusStructureDefinitionModalComponent} from './containers/texteditor/structure-definition/thesaurus-structure-definition-modal.component';
import {ThesaurusSmartTextEditorViewComponent} from './containers/texteditor/thesaurus-smart-text-editor-view.component';
import {StructureDefinitionListComponent} from './containers/structure-definition/structure-definition-list.component';
import {StructureDefinitionEditComponent} from './containers/structure-definition/structure-definition-edit.component';
import {StructureDefinitionService} from './services/structure-definition.service';
import {TemplateService} from './services/template.service';
import {TemplateListComponent} from './containers/template/template-list.component';
import {TemplateEditComponent} from './containers/template/template-edit.component';
import {StructureDefinitionTreeComponent} from './containers/structure-definition/structure-definition-tree.component';
import {StructureDefinitionTypeListComponent} from './containers/structure-definition/structure-definition-type-list.component';
import {StructureDefinitionConstraintListComponent} from './containers/structure-definition/structure-definition-constraint-list.component';
import {ThesaurusTemplateModalComponent} from './containers/texteditor/template/thesaurus-template-modal.component';
import {TemplateViewComponent} from './containers/template/template-view.component';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {ThesaurusLibModule} from 'term-web/thesaurus/_lib';
import {ResourcesLibModule} from '../resources/_lib';
import {IntegrationLibModule} from '../integration/_lib';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PageLinkService} from 'term-web/thesaurus/services/page-link.service';

export const THESAURUS_ROUTES: Routes = [
  {path: 'pages', component: ThesaurusPageComponent},
  {path: 'pages/:slug', component: ThesaurusPageComponent},
  {path: 'pages/:slug/edit', component: ThesaurusPageEditComponent, data: {privilege: ['*.Thesaurus.edit']}},
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
    MarinaMarkdownModule,

    DragDropModule,
  ],
  declarations: [
    ThesaurusSidebarComponent,
    ThesaurusPageComponent,
    ThesaurusPageEditComponent,
    ThesaurusPageModalComponent,
    ThesaurusTextareaComponent,
    ThesaurusLinkModalComponent,
    ThesaurusStructureDefinitionModalComponent,
    ThesaurusTemplateModalComponent,
    ThesaurusDropdownComponent,
    ThesaurusDropdownOptionComponent,
    ThesaurusSmartTextEditorComponent,
    ThesaurusSmartTextEditorViewComponent,

    StructureDefinitionListComponent,
    StructureDefinitionEditComponent,
    StructureDefinitionTreeComponent,
    StructureDefinitionTypeListComponent,
    StructureDefinitionConstraintListComponent,

    TemplateListComponent,
    TemplateEditComponent,
    TemplateViewComponent
  ],
  providers: [PageService, PageLinkService, StructureDefinitionService, TemplateService]
})
export class ThesaurusModule {
}
