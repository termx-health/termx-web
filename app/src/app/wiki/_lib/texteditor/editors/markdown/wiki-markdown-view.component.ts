import {Component, Input} from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {codeSystemConceptMatrixPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/code-system-concept-matrix.plugin';
import {valueSetConceptMatrixPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/value-set-concept-matrix.plugin';
import {drawioPlugin} from './plugins/drawio.plugin';
import {localImage} from './plugins/image.plugin';
import {localLink} from './plugins/link.plugin';
import {sourceLinePlugin} from './plugins/source-line.plugin';
import {structureDefinitionCodePlugin} from './plugins/structure-definition-code.plugin';
import {structureDefinitionFshPlugin} from './plugins/structure-definition-fsh.plugin';


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
})
export class WikiMarkdownViewComponent {
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

  public constructor(
    private preferences: PreferencesService,
  ) { }
}
