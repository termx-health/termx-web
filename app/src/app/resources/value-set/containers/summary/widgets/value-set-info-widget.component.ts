import {Component, Input} from '@angular/core';
import {collect} from '@kodality-web/core-util';
import {Telecom, ValueSet} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-value-set-info-widget',
  templateUrl: 'value-set-info-widget.component.html'
})
export class ValueSetInfoWidgetComponent {
  @Input() public valueSet: ValueSet;

  protected getTelecoms = (vs: ValueSet):  {[dType: string]: Telecom[]} => {
    const telecoms = vs.contacts ? vs.contacts.flatMap(c => c.telecoms || []) : [];
    return collect(telecoms, t => t.system);
  };
}
