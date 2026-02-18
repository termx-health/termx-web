import { Component, Input, inject } from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {codeSystemConceptMatrixPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/code-system-concept-matrix.plugin';
import {valueSetConceptMatrixPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/value-set-concept-matrix.plugin';
import {drawioPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/drawio.plugin';
import {localImage} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/image.plugin';
import {localLink} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/link.plugin';
import {sourceLinePlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/source-line.plugin';
import {structureDefinitionCodePlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/structure-definition-code.plugin';
import {structureDefinitionFshPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/structure-definition-fsh.plugin';
import { MarinaMarkdownModule } from '@kodality-web/marina-markdown';


@Component({
    selector: 'tw-wiki-markdown-view',
    template: `
    <m-markdown
        [mData]="value ?? ''"
        [mPlugins]="plugins.list"
        [mPluginOptions]="plugins.options"
        [mPrerender]="prerender"
    />
  `,
    imports: [MarinaMarkdownModule],
})
export class WikiMarkdownViewComponent {
  private preferences = inject(PreferencesService);

  @Input() public value?: string;
  @Input() public prerender?: boolean;

  protected plugins = {
    list: [
      sourceLinePlugin,
      localLink,
      localImage,
      structureDefinitionCodePlugin,
      structureDefinitionFshPlugin,
      codeSystemConceptMatrixPlugin,
      valueSetConceptMatrixPlugin,
      drawioPlugin
    ],
    options: {
      spaceId: this.preferences.spaceId // todo: provide as @Input?
    }
  };
}
