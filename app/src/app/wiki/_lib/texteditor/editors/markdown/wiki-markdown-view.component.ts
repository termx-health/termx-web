import {Component, Input} from '@angular/core';
import {sourceLinePlugin} from './plugins/source-line.plugin';
import {localLink} from './plugins/link.plugin';
import {localImage} from './plugins/image.plugin';
import {structureDefinitionCodePlugin} from './plugins/structure-definition-code.plugin';
import {structureDefinitionFshPlugin} from './plugins/structure-definition-fsh.plugin';
import {drawioPlugin} from './plugins/drawio.plugin';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';


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
