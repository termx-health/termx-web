import {Component, Input} from '@angular/core';
import {PageContent} from '../../../_lib';

@Component({
  selector: 'tw-thesaurus-page-header',
  templateUrl: 'thesaurus-page-header.component.html',
  styles: [`
    .page__header h2 {
      margin: 0
    }
  `]
})
export class ThesaurusPageHeaderComponent {
  @Input() public pageContent: PageContent;
}
