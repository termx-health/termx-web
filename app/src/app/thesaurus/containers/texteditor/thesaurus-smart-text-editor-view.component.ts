import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'twa-smart-text-editor-view',
  templateUrl: './thesaurus-smart-text-editor-view.component.html'
})
export class ThesaurusSmartTextEditorViewComponent implements OnChanges {
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public value?: string;

  public processedValue: {type: string, value: any}[] = [];

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.processValue(this.value);
    }
  }

  private processValue(value: string): void {
    this.processedValue = [];
    value.split(/{{|}}/).forEach((v, i) => {
      if (i % 2 == 0) {
        this.processedValue.push({type: 'text', value: v});
      } else {
        const template = v.split(/:(.*)|\|/s);
        this.processedValue.push({type: template[0], value: template[1]});
      }
    });
  }
}
