import {Component, EnvironmentInjector, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {structureDefinitionCodePlugin} from './plugins/structure-definition-code.plugin';
import {createCustomElement} from '@angular/elements';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib';
import {structureDefinitionFshPlugin} from 'term-web/wiki/_lib/texteditor/plugins/structure-definition-fsh.plugin';
import transformLink from './plugins/external-link.plugin';
import {isDefined} from '@kodality-web/core-util';

@Component({
  selector: 'tw-smart-text-editor-view',
  templateUrl: 'wiki-smart-text-editor-view.component.html',
  styles: [`
    ::ng-deep tw-smart-text-editor-view .ql-editor {
      padding: 0;
    }
  `]
})
export class WikiSmartTextEditorViewComponent implements OnChanges {
  @Input() public prerendered?: boolean;
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
    if (changes['value'] && isDefined(this.value)) {
      this.processValue(this.value);
    }
  }

  private processValue(value: string): void {
    this.processedValue = [{type: 'text', value: value}];
    this.processedValue = this.processLink(this.processedValue);
  }

  private processLink(processedValue: ProcessedValue[]): ProcessedValue[] {
    const processLinkValue = (mdLink: string): string => {
      // matches "[label](uri)"
      const [_, label, uri] = [...mdLink.matchAll(/\[(.*)]\((.*)\)/g)][0];
      if (!uri.includes(':')) {
        return mdLink;
      }
      if (!["cs", "vs", "ms", "concept", "page"].includes(uri.split(":")[0])) {
        return mdLink;
      }

      // decorates link with missing parts
      return `[${label}](${transformLink(uri, {spaceId: this.preferences.spaceId})})`;
    };

    processedValue.forEach(pv => {
      if (pv.type === 'text') {
        const matches = pv.value.match(/\[(.*?)]\(.*?\)/g);
        matches?.forEach(m => pv.value = pv.value!.replace(m, processLinkValue(m)));
      }
    });
    return processedValue;
  }

}

export class ProcessedValue {
  public type?: string;
  public value?: string;
}
