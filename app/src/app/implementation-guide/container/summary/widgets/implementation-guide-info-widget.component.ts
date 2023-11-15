import {Component, Input} from '@angular/core';
import {Telecom} from 'app/src/app/resources/_lib';
import {ImplementationGuide} from 'term-web/implementation-guide/_lib';

@Component({
  selector: 'tw-implementation-guide-info-widget',
  templateUrl: 'implementation-guide-info-widget.component.html'
})
export class ImplementationGuideInfoWidgetComponent {
  @Input() public ig: ImplementationGuide;

  protected getTelecoms = (ig: ImplementationGuide): Telecom[] => {
    return ig.contacts?.flatMap(c => c.telecoms);
  };
}
