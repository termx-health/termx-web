import {NgModule} from '@angular/core';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {NzListModule} from 'ng-zorro-antd/list';
import {PageLibService} from './page/page-lib.service';
import {PageSelectComponent} from './page/page-select.component';
import {PortalModule} from '@angular/cdk/portal';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TagLibService} from './tag/tag-lib.service';
import {TemplateLibService} from './template/template-lib.service';
import {ThesaurusRendererTemplateComponent} from './texteditor/renderers/thesaurus-renderer-template.component';
import {ThesaurusDropdownComponent} from './texteditor/menu/dropdown/thesaurus-dropdown.component';
import {ThesaurusQuickActionsMenuComponent} from './texteditor/menu/thesaurus-quick-actions-menu.component';
import {ThesaurusDropdownOptionComponent} from './texteditor/menu/dropdown/thesaurus-dropdown-option.component';
import {ThesaurusModalLinkComponent} from './texteditor/menu/modals/thesaurus-modal-link.component';
import {ThesaurusModalStructureDefinitionComponent} from './texteditor/menu/modals/thesaurus-modal-structure-definition.component';
import {ThesaurusModalTemplateComponent} from './texteditor/menu/modals/thesaurus-modal-template.component';
import {ThesaurusSmartTextEditorComponent} from './texteditor/thesaurus-smart-text-editor.component';
import {ThesaurusSmartTextEditorViewComponent} from './texteditor/thesaurus-smart-text-editor-view.component';
import {ThesaurusTextareaComponent} from './texteditor/thesaurus-textarea.component';
import {ModelerLibModule} from 'term-web/modeler/_lib';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    CoreUtilModule,
    PortalModule,
    NzListModule,
    ResourcesLibModule,
    CoreUiModule,
    MarinaMarkdownModule,
    MarinaQuillModule,
    ModelerLibModule,
  ],
  providers: [
    TagLibService,
    PageLibService,
    TemplateLibService,
  ],
  declarations: [
    // page
    PageSelectComponent,

    // template
    ThesaurusRendererTemplateComponent,

    // text editor
    ThesaurusSmartTextEditorComponent,
    ThesaurusSmartTextEditorViewComponent,

    ThesaurusTextareaComponent,
    ThesaurusDropdownComponent,
    ThesaurusDropdownOptionComponent,

    ThesaurusQuickActionsMenuComponent,
    ThesaurusModalLinkComponent,
    ThesaurusModalStructureDefinitionComponent,
    ThesaurusModalTemplateComponent,
  ],
  exports: [
    PageSelectComponent,
    ThesaurusDropdownComponent,
    ThesaurusDropdownOptionComponent,
    ThesaurusModalLinkComponent,
    ThesaurusModalStructureDefinitionComponent,
    ThesaurusModalTemplateComponent,
    ThesaurusRendererTemplateComponent,
    ThesaurusSmartTextEditorComponent,
    ThesaurusSmartTextEditorViewComponent,
    ThesaurusTextareaComponent,
  ]
})
export class ThesaurusLibModule {
}
