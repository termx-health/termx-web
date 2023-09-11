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
import {WikiQuickActionsDropdownComponent} from 'term-web/wiki/_lib/texteditor/quick-actions/components/wiki-quick-actions-dropdown.component';
import {WikiQuickActionsMenuComponent} from './texteditor/quick-actions/wiki-quick-actions-menu.component';
import {WikiQuickActionsDropdownOptionComponent} from 'term-web/wiki/_lib/texteditor/quick-actions/components/wiki-quick-actions-dropdown-option.component';
import {WikiQuickActionsLinkComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-link.component';
import {WikiQuickActionsStructureDefinitionComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-structure-definition.component';
import {WikiQuickActionsTemplateComponent} from './texteditor/quick-actions/actions/wiki-quick-actions-template.component';
import {WikiSmartTextEditorComponent} from './texteditor/wiki-smart-text-editor.component';
import {WikiSmartTextEditorViewComponent} from './texteditor/wiki-smart-text-editor-view.component';
import {WikiMarkdownEditorComponent} from './texteditor/editors/markdown/wiki-markdown-editor.component';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {SpaceLibModule} from 'term-web/space/_lib';
import {PageContentSelectComponent} from 'term-web/wiki/_lib/page/components/page-content-select.component';
import {WikiCommentPopoverComponent} from 'term-web/wiki/_lib/texteditor/comments/wiki-comment-popover.component';
import {PageCommentLibService} from 'term-web/wiki/_lib/page/services/page-comment-lib.service';
import {WikiQuillEditorComponent} from 'term-web/wiki/_lib/texteditor/editors/quill/wiki-quill-editor.component';
import {WikiMarkdownViewComponent} from 'term-web/wiki/_lib/texteditor/editors/markdown/wiki-markdown-view.component';

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

    WikiSmartTextEditorComponent,
    WikiSmartTextEditorViewComponent,

    WikiMarkdownEditorComponent,
    WikiMarkdownViewComponent,
  ]
})
export class WikiLibModule {
}
