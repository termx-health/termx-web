import {Component, EnvironmentInjector, Input} from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {structureDefinitionCodePlugin} from './markdown-plugins/structure-definition-code.plugin';
import {structureDefinitionFshPlugin} from './markdown-plugins/structure-definition-fsh.plugin';
import {createCustomElement} from '@angular/elements';
import {drawioPlugin} from './markdown-plugins/drawio.plugin';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib';
import {localImage} from './markdown-plugins/image.plugin';
import {localLink} from 'term-web/wiki/_lib/texteditor/markdown-plugins/link.plugin';

@Component({
  selector: 'tw-smart-text-editor-view',
  templateUrl: 'wiki-smart-text-editor-view.component.html',
  styles: [`
    ::ng-deep tw-smart-text-editor-view .ql-editor {
      padding: 0;
    }
  `]
})
export class WikiSmartTextEditorViewComponent {
  @Input() public prerender?: boolean;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public value?: string;
  @Input() public lang?: string;

  protected plugins = {
    list: [
      localLink,
      localImage,
      structureDefinitionCodePlugin,
      structureDefinitionFshPlugin,
      drawioPlugin
    ],
    options: {
      spaceId: this.preferences.spaceId
    }
  };


  public constructor(
    private preferences: PreferencesService,
    injector: EnvironmentInjector
  ) {
    if (!customElements.get('ce-structure-definition')) {
      customElements.define('ce-structure-definition', createCustomElement(StructureDefinitionTreeComponent, {injector}));
    }
  }
}
