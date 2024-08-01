import {Component, Input} from '@angular/core';
import {group, collect} from '@kodality-web/core-util';
import {CodeSystem, Telecom} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-code-system-info-widget',
  templateUrl: 'code-system-info-widget.component.html'
})
export class CodeSystemInfoWidgetComponent {
  @Input() public codeSystem: CodeSystem;

  protected getTelecoms = (cs: CodeSystem): {[dType: string]: Telecom[]} => {
    return collect(cs.contacts?.flatMap(c => c.telecoms), t => t.system);
  };
  protected readonly group = group;
}
