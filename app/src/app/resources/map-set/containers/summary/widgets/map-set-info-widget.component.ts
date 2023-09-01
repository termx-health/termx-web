import {Component, Input} from '@angular/core';
import {MapSet, Telecom} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-map-set-info-widget',
  templateUrl: 'map-set-info-widget.component.html'
})
export class MapSetInfoWidgetComponent {
  @Input() public mapSet: MapSet;

  protected getTelecoms = (ms: MapSet): Telecom[] => {
    return ms.contacts?.flatMap(c => c.telecoms);
  };
}
