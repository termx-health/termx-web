import {Component, Input} from '@angular/core';

@Component({
  selector: 'tw-resource-readonly-concept',
  templateUrl: 'resource-readonly-concept.component.html'
})
export class ResourceReadonlyConceptComponent {
  @Input() public value?: any;
  @Input() public valueSet?: string;
  @Input() public codeSystem?: string;
}
