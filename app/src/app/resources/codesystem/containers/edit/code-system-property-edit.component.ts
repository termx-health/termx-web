import {Component, EventEmitter, Input, Output} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';

@Component({
  selector: 'twa-code-system-property-edit',
  templateUrl: './code-system-property-edit.component.html',
})
export class CodeSystemPropertyEditComponent {
  @Input() public property?: EntityProperty;
  @Output() public propertyChange = new EventEmitter<EntityProperty>();
}
