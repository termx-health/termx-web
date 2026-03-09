import {Component, Input} from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
  selector: 'tw-resource-readonly-concept',
  templateUrl: 'resource-readonly-concept.component.html',
  imports: [AsyncPipe, NgTemplateOutlet, LocalizedConceptNamePipe]
})
export class ResourceReadonlyConceptComponent {
  @Input() public value?: any;
  @Input() public valueSet?: string;
  @Input() public codeSystem?: string;
}
