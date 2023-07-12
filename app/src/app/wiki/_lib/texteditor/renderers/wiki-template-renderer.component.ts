import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TemplateLibService} from '../../template/services/template-lib.service';

@Component({
  selector: 'tw-template-view',
  template: `
    <tw-smart-text-editor-view
        *ngIf="template"
        [value]="template"
        [valueType]="contentType"
        [lang]="lang"
    ></tw-smart-text-editor-view>
  `
})
export class WikiTemplateRendererComponent implements OnChanges {
  @Input() public templateCode?: string;
  @Input() public lang?: string;
  public template?: string;
  public contentType?: 'html' | 'markdown';

  public constructor(private templateService: TemplateLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['templateCode'] && this.templateCode) {
      this.loadTemplate(this.templateCode);
    }
  }

  private loadTemplate(code: string): void {
    this.templateService.searchTemplates({code: code, limit: 1}).subscribe(resp => {
      this.template = resp.data[0]!.contents?.find(c => c.lang === this.lang)?.content;
      this.contentType = resp.data[0]!.contentType === 'html' ? 'html' : 'markdown';
    });
  }
}
