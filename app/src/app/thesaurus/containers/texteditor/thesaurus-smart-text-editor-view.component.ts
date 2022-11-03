import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'twa-smart-text-editor-view',
  templateUrl: './thesaurus-smart-text-editor-view.component.html'
})
export class ThesaurusSmartTextEditorViewComponent implements OnChanges {
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public value?: string;
  @Input() public lang?: string;

  public processedValue: ProcessedValue[] = [];

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.processValue(this.value);
    }
  }

  private processValue(value: string): void {
    this.processedValue = [{type: 'text', value: value}];
    this.processedValue = this.processInsertion(this.processedValue);
    this.processedValue = this.processLink(this.processedValue);
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
        const matches = pv.value!.match(/\[(.*?)\]\(.*?\)/g);
        matches?.forEach(m => pv.value = pv.value!.replace(m, this.processLinkValue(m)));
      }
    });
    return processedValue;
  }

  private processLinkValue(link: string): string {
    const split = link.split(/\(|\)/);
    if (!split[1].includes(':')) {
      return link;
    }

    let value = split[0];

    const type = split[1].split(':')[0];
    const typeValue = split[1].split(':')[1];
    if (type === 'cs') {
      value += '(/resources/code-systems/' + typeValue + '/view)';
    } else if (type === 'vs') {
      value += '(/resources/value-sets/' + typeValue + '/view)';
    } else if (type === 'ms') {
      value += '(/resources/map-sets/' + typeValue + '/view)';
    } else if (type === 'concept') {
      const cs = typeValue.split('|')[0];
      const concept = typeValue.split('|')[1];
      value += cs !== 'snomed-ct' ? '(/resources/code-systems/' + cs + '/concepts/' + concept + '/view)' : '(/integration/snomed/' + concept + ')';
    } else if (type === 'page') {
      value += '(/thesaurus/pages/' + typeValue + ')';
    } else {
      return link;
    }
    return value;
  }
}

export class ProcessedValue {
  public type?: string;
  public value?: string;
}
