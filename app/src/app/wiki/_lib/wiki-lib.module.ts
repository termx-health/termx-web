import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {NzListModule} from 'ng-zorro-antd/list';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {SpaceLibModule} from 'term-web/space/_lib';
import {PageContentSelectComponent} from 'term-web/wiki/_lib/page/components/page-content-select.component';
import {PageContentTreeSelectComponent} from 'term-web/wiki/_lib/page/components/page-content-tree-select.component';
import {PageCommentLibService} from 'term-web/wiki/_lib/page/services/page-comment-lib.service';
import {WikiCommentPopoverComponent} from 'term-web/wiki/_lib/texteditor/comments/wiki-comment-popover.component';
import {WikiMarkdownViewComponent} from 'term-web/wiki/_lib/texteditor/editors/markdown/wiki-markdown-view.component';
import {WikiQuillEditorComponent} from 'term-web/wiki/_lib/texteditor/editors/quill/wiki-quill-editor.component';
import {WikiQuickActionsDropdownOptionComponent} from 'term-web/wiki/_lib/texteditor/quick-actions/components/wiki-quick-actions-dropdown-option.component';
import {WikiQuickActionsDropdownComponent} from 'term-web/wiki/_lib/texteditor/quick-actions/components/wiki-quick-actions-dropdown.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {PageSelectComponent} from './page/components/page-select.component';
import {PageLibService} from './page/services/page-lib.service';
import {TagLibService} from './tag/services/tag-lib.service';
import {TemplateLibService} from './template/services/template-lib.service';
import {WikiMarkdownEditorComponent} from './texteditor/editors/markdown/wiki-markdown-editor.component';
import {WikiQuickActionsLinkComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-link.component';
import {WikiQuickActionsStructureDefinitionComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-structure-definition.component';
import {WikiQuickActionsTemplateComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-template.component';
import {WikiQuickActionsMenuComponent} from './texteditor/quick-actions/wiki-quick-actions-menu.component';
import {WikiSmartTextEditorViewComponent} from './texteditor/wiki-smart-text-editor-view.component';
import {WikiSmartTextEditorComponent} from './texteditor/wiki-smart-text-editor.component';

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
    PageCommentLibService,
    TemplateLibService,
  ],
  declarations: [
    // page
    PageSelectComponent,
    PageContentSelectComponent,
    PageContentTreeSelectComponent,

    // text editor
    WikiSmartTextEditorComponent,
    WikiSmartTextEditorViewComponent,
    // markdown
    WikiMarkdownEditorComponent,
    WikiMarkdownViewComponent,
    // quill
    WikiQuillEditorComponent,
    WikiCommentPopoverComponent,

    // quick actions
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
    PageContentTreeSelectComponent,

    WikiSmartTextEditorComponent,
    WikiSmartTextEditorViewComponent,

    WikiMarkdownEditorComponent,
    WikiMarkdownViewComponent,
  ]
})
export class WikiLibModule {
}
