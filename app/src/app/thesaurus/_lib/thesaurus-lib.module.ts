import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {NzListModule} from 'ng-zorro-antd/list';
import {PageLibService} from './page/services/page-lib.service';
import {PageSelectComponent} from './page/components/page-select.component';
import {PortalModule} from '@angular/cdk/portal';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TagLibService} from './tag/services/tag-lib.service';
import {TemplateLibService} from './template/services/template-lib.service';
import {ThesaurusRendererTemplateComponent} from './texteditor/renderers/thesaurus-renderer-template.component';
import {ThesaurusDropdownComponent} from './texteditor/quick-actions/dropdown/thesaurus-dropdown.component';
import {ThesaurusQuickActionsMenuComponent} from './texteditor/quick-actions/thesaurus-quick-actions-menu.component';
import {ThesaurusDropdownOptionComponent} from './texteditor/quick-actions/dropdown/thesaurus-dropdown-option.component';
import {ThesaurusQuickActionsLinkComponent} from './texteditor/quick-actions/actions/thesaurus-quick-actions-link.component';
import {ThesaurusQuickActionsStructureDefinitionComponent} from './texteditor/quick-actions/actions/thesaurus-quick-actions-structure-definition.component';
import {ThesaurusQuickActionsTemplateComponent} from './texteditor/quick-actions/actions/thesaurus-quick-actions-template.component';
import {ThesaurusSmartTextEditorComponent} from './texteditor/thesaurus-smart-text-editor.component';
import {ThesaurusSmartTextEditorViewComponent} from './texteditor/thesaurus-smart-text-editor-view.component';
import {ThesaurusTextareaComponent} from './texteditor/thesaurus-textarea.component';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {SpaceLibModule} from 'term-web/space/_lib';

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
    SpaceLibModule,
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
    ThesaurusQuickActionsLinkComponent,
    ThesaurusQuickActionsStructureDefinitionComponent,
    ThesaurusQuickActionsTemplateComponent,
  ],
  exports: [
    PageSelectComponent,
    ThesaurusDropdownComponent,
    ThesaurusDropdownOptionComponent,
    ThesaurusQuickActionsLinkComponent,
    ThesaurusQuickActionsStructureDefinitionComponent,
    ThesaurusQuickActionsTemplateComponent,
    ThesaurusRendererTemplateComponent,
    ThesaurusSmartTextEditorComponent,
    ThesaurusSmartTextEditorViewComponent,
    ThesaurusTextareaComponent,
  ]
})
export class ThesaurusLibModule {
}
