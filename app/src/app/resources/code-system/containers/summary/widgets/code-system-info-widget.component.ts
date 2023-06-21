import {Component, Input} from '@angular/core';
import {CodeSystem, Telecom} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-code-system-info-widget',
  templateUrl: 'code-system-info-widget.component.html'
})
export class CodeSystemInfoWidgetComponent {
  @Input() public codeSystem: CodeSystem;

  protected getTelecoms = (cs: CodeSystem): Telecom[] => {
    return cs.contacts?.flatMap(c => c.telecoms);
  };
}
