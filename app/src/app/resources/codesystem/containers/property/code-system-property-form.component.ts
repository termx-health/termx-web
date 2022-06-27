import {Component, Input} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';

@Component({
  selector: 'twa-code-system-property-form',
  templateUrl: './code-system-property-form.component.html',
})
export class CodeSystemPropertyFormComponent {
  @Input() public property?: EntityProperty;
}
