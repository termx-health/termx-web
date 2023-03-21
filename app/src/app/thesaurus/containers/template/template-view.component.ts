import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TemplateLibService} from 'term-web/thesaurus/_lib';

@Component({
  selector: 'tw-template-view',
  templateUrl: './template-view.component.html'
})
export class TemplateViewComponent implements OnChanges {
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
