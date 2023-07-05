import {Component, EnvironmentInjector, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {structureDefinitionCodePlugin} from './plugins/structure-definition-code.plugin';
import {createCustomElement} from '@angular/elements';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib';
import {structureDefinitionFshPlugin} from 'term-web/thesaurus/_lib/texteditor/plugins/structure-definition-fsh.plugin';

@Component({
  selector: 'tw-smart-text-editor-view',
  templateUrl: './thesaurus-smart-text-editor-view.component.html',
  styles: [`
    ::ng-deep tw-smart-text-editor-view .ql-editor {
      padding: 0;
    }
  `]
})
export class ThesaurusSmartTextEditorViewComponent implements OnChanges {
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public value?: string;
  @Input() public lang?: string;

  public processedValue: ProcessedValue[] = [];
  protected plugins = [
    structureDefinitionCodePlugin,
    structureDefinitionFshPlugin
  ];

  public constructor(
    private preferences: PreferencesService,
    private injector: EnvironmentInjector
  ) {
    if (!customElements.get('ce-structure-definition')) {
      customElements.define('ce-structure-definition', createCustomElement(StructureDefinitionTreeComponent, {injector}));
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.processValue(this.value);
    }
  }

  private processValue(value: string): void {
    this.processedValue = [{type: 'text', value: value}];
    this.processedValue = this.processLink(this.processedValue);
  }

  private processLink(processedValue: ProcessedValue[]): ProcessedValue[] {
    processedValue.forEach(pv => {
      if (pv.type === 'text') {
        const matches = pv.value.match(/\[(.*?)]\(.*?\)/g);
        matches?.forEach(m => pv.value = pv.value!.replace(m, this.processLinkValue(m)));
      }
    });
    return processedValue;
  }

  private processLinkValue(mdLink: string): string {
    const getLink = (combinedLink: string): string => {
      const [system, value] = combinedLink.split(':');

      switch (system) {
        case 'cs':
          return `/resources/code-systems/${value}/summary`;
        case 'vs':
          return `/resources/value-sets/${value}/summary`;
        case 'ms':
          return `/resources/map-sets/${value}/view`;
        case 'concept':
          const [cs, concept] = value.split('|');
          return cs === 'snomed-ct'
            ? `/integration/snomed/dashboard/${concept}`
            : `/resources/code-systems/${cs}/concepts/${concept}/view`;
        case 'page':
          return this.preferences.spaceId
            ? `/thesaurus/${this.preferences.spaceId}/pages/${value}`
            : `/thesaurus/pages/${value}`;
        default:
          return combinedLink;
      }
    };

    const isUrl = (link: string): boolean => {
      try {
        return !!new URL(link);
      } catch {
        return false;
      }
    };

    // matches "[label](uri)"
    const [_, label, uri] = [...mdLink.matchAll(/\[(.*)]\((.*)\)/g)][0];
    if (!uri.includes(':')) {
      if (!isUrl(uri) && !uri.startsWith("/")) {
        return `[${label}](${getLink(`page:${uri}`)})`;
      }
      return mdLink;
    }

    return `[${label}](${getLink(uri)})`;
  }
}

export class ProcessedValue {
  public type?: string;
  public value?: string;
}
