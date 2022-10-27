import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SharedModule} from '../core/shared/shared.module';
import {ThesaurusSidebarComponent} from './containers/page/thesaurus-sidebar.component';
import {PageService} from './services/page.service';
import {ThesaurusPageComponent} from './containers/page/thesaurus-page.component';
import {ThesaurusPageEditComponent} from './containers/page/thesaurus-page-edit.component';
import {ThesaurusLibModule} from 'terminology-lib/thesaurus';
import {ThesaurusPageModalComponent} from './containers/page/thesaurus-page-modal.component';
import {ThesaurusTextareaComponent} from './containers/texteditor/thesaurus-textarea.component';
import {ThesaurusDropdownComponent} from './containers/texteditor/thesaurus-dropdown.component';
import {PortalModule} from '@angular/cdk/portal';
import {ThesaurusDropdownOptionComponent} from './containers/texteditor/thesaurus-dropdown-option.component';
import {ThesaurusSmartTextEditorComponent} from './containers/texteditor/thesaurus-smart-text-editor.component';
import {ThesaurusLinkModalComponent} from './containers/texteditor/modal/thesaurus-link-modal.component';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {ThesaurusStructureDefinitionModalComponent} from './containers/texteditor/modal/thesaurus-structure-definition-modal.component';
import {ThesaurusSmartTextEditorViewComponent} from './containers/texteditor/thesaurus-smart-text-editor-view.component';
import {StructureDefinitionListComponent} from './containers/structuredefinition/structure-definition-list.component';
import {StructureDefinitionEditComponent} from './containers/structuredefinition/structure-definition-edit.component';
import {StructureDefinitionService} from './services/structure-definition.service';
import {TemplateService} from './services/template.service';
import {TemplateListComponent} from './containers/template/template-list.component';
import {TemplateEditComponent} from './containers/template/template-edit.component';
import {IntegrationLibModule} from 'terminology-lib/integration';
import {StructureDefinitionTreeComponent} from './containers/structuredefinition/structure-definition-tree.component';
import {StructureDefinitionTypeListComponent} from './containers/structuredefinition/structure-definition-type-list.component';
import {StructureDefinitionConstraintListComponent} from './containers/structuredefinition/structure-definition-constraint-list.component';

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
    SharedModule,
    ThesaurusLibModule,

    PortalModule,
    ResourcesLibModule,
    IntegrationLibModule
  ],
  declarations: [
    ThesaurusSidebarComponent,
    ThesaurusPageComponent,
    ThesaurusPageEditComponent,
    ThesaurusPageModalComponent,
    ThesaurusTextareaComponent,
    ThesaurusLinkModalComponent,
    ThesaurusStructureDefinitionModalComponent,
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
    TemplateEditComponent
  ],
  providers: [PageService, StructureDefinitionService, TemplateService]
})
export class ThesaurusModule {
}
