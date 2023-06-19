import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

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
        const matches = pv.value!.match(/\[(.*?)\]\(.*?\)/g);
        matches?.forEach(m => pv.value = pv.value!.replace(m, this.processLinkValue(m)));
      }
    });
    return processedValue;
  }

  private processLinkValue(link: string): string {
    const split = link.split(']')[1].split(/\(|\)/);
    if (!split[1].includes(':')) {
      return link;
    }

    let value = link.split(']')[0] + ']';

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
