import {Component, Input} from '@angular/core';
import {Telecom, ValueSet} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-value-set-info-widget',
  templateUrl: 'value-set-info-widget.component.html'
})
export class ValueSetInfoWidgetComponent {
  @Input() public valueSet: ValueSet;

  protected getTelecoms = (vs: ValueSet): Telecom[] => {
    return vs.contacts?.flatMap(c => c.telecoms);
  };
}
