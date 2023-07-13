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
import {WikiTemplateRendererComponent} from './texteditor/renderers/wiki-template-renderer.component';
import {WikiQuickActionsDropdownComponent} from './texteditor/quick-actions/dropdown/wiki-quick-actions-dropdown.component';
import {WikiQuickActionsMenuComponent} from './texteditor/quick-actions/wiki-quick-actions-menu.component';
import {WikiQuickActionsDropdownOptionComponent} from './texteditor/quick-actions/dropdown/wiki-quick-actions-dropdown-option.component';
import {WikiQuickActionsLinkComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-link.component';
import {WikiQuickActionsStructureDefinitionComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-structure-definition.component';
import {WikiQuickActionsTemplateComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-template.component';
import {WikiSmartTextEditorComponent} from './texteditor/wiki-smart-text-editor.component';
import {WikiSmartTextEditorViewComponent} from './texteditor/wiki-smart-text-editor-view.component';
import {WikiTextareaComponent} from './texteditor/wiki-textarea.component';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {SpaceLibModule} from 'term-web/space/_lib';
import {PageContentSelectComponent} from 'term-web/wiki/_lib/page/components/page-content-select.component';

@NgModule({
  imports: [
    FormsModule,
    PortalModule,

    MarinaComponentsModule,
    MarinaMarkdownModule,
    MarinaQuillModule,
    CoreUtilModule,
    NzListModule,

    CoreUiModule,
    ResourcesLibModule,
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
    PageContentSelectComponent,

    // template
    WikiTemplateRendererComponent,

    // text editor
    WikiSmartTextEditorComponent,
    WikiSmartTextEditorViewComponent,

    WikiTextareaComponent,
    WikiQuickActionsDropdownComponent,
    WikiQuickActionsDropdownOptionComponent,

    WikiQuickActionsMenuComponent,
    WikiQuickActionsLinkComponent,
    WikiQuickActionsStructureDefinitionComponent,
    WikiQuickActionsTemplateComponent,
  ],
  exports: [
    PageSelectComponent,
    PageContentSelectComponent,
    WikiQuickActionsDropdownComponent,
    WikiQuickActionsDropdownOptionComponent,
    WikiQuickActionsLinkComponent,
    WikiQuickActionsStructureDefinitionComponent,
    WikiQuickActionsTemplateComponent,
    WikiTemplateRendererComponent,
    WikiSmartTextEditorComponent,
    WikiSmartTextEditorViewComponent,
    WikiTextareaComponent,
  ]
})
export class WikiLibModule {
}
