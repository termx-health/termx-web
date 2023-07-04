import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';

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

  public constructor(
    private preferences: PreferencesService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.processValue(this.value);
    }
  }

  private processValue(value: string): void {
    this.processedValue = [{type: 'text', value: value}];
    this.processedValue = this.processInsertion(this.processedValue);
    this.processedValue = this.processLink(this.processedValue);
    this.processedValue = this.processFsh(this.processedValue);
  }

  private processInsertion(processedValue: ProcessedValue[]): ProcessedValue[] {
    const result: ProcessedValue[] = [];
    processedValue.forEach(pv => {
      if (pv.type === 'text') {
        pv.value!.split(/{{|}}/).forEach((v, i) => {
          if (i % 2 == 0) {
            result.push({type: 'text', value: v});
          } else {
            const template = v.split(/:(.*)|\|/s);
            result.push({type: template[0], value: template[1]});
          }
        });
      } else {
        result.push(pv);
      }
    });
    return result;
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

  private processFsh(processedValue: ProcessedValue[]): ProcessedValue[] {
    let processAgain = false;
    const res: ProcessedValue[] = [];
    processedValue.forEach(pv => {
      if (pv.type === 'text') {
        const matches = pv.value!.match(/```fsh(.*?)```/gs);
        if (matches && matches.length > 0) {
          pv.value?.split(matches[0]).forEach((s, i) => {
            if (i !== 0) {
              res.push({type: 'fsh', value: matches[0]});
            }
            res.push({type: 'text', value: s});
          });
        } else {
          res.push(pv);
        }
        processAgain = !!matches && matches.length > 1;
      } else {
        res.push(pv);
      }
    });
    if (processAgain) {
      return this.processFsh(res);
    }
    return res;
  }
}

export class ProcessedValue {
  public type?: string;
  public value?: string;
}
