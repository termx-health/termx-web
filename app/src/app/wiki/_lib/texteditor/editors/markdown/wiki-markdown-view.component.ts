import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import {of, Subscription} from 'rxjs';
import {environment} from 'environments/environment';
import {AuthService} from 'term-web/core/auth';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {codeSystemConceptMatrixPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/code-system-concept-matrix.plugin';
import {valueSetConceptMatrixPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/value-set-concept-matrix.plugin';
import {drawioPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/drawio.plugin';
import {localImage} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/image.plugin';
import {localLink} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/link.plugin';
import {sourceLinePlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/source-line.plugin';
import {structureDefinitionCodePlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/structure-definition-code.plugin';
import {structureDefinitionFshPlugin} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/structure-definition-fsh.plugin';
import { MarinaMarkdownModule } from '@termx-health/markdown';


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
export class WikiMarkdownViewComponent implements OnInit, OnDestroy {
  private preferences = inject(PreferencesService);
  private authService = inject(AuthService);

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
      spaceId: this.preferences.spaceId, // todo: provide as @Input?
      token: undefined as string | undefined // appended to page attachment URLs so <img>/downloads authenticate
    }
  };

  private tokenSub?: Subscription;

  public ngOnInit(): void {
    // The current auth token, so attachment images/downloads can authenticate via ?token=.
    const token$ = environment.yupiEnabled ? of('yupi') : this.authService.token;
    this.tokenSub = token$.subscribe(token => {
      this.plugins = {...this.plugins, options: {...this.plugins.options, token}};
    });
  }

  public ngOnDestroy(): void {
    this.tokenSub?.unsubscribe();
  }
}
