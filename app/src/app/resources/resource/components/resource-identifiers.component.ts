import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, Identifier, isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'tw-resource-identifiers',
  templateUrl: './resource-identifiers.component.html',
})
export class ResourceIdentifiersComponent {
  @Input() public identifiers?: Identifier[];
  @Output() public identifiersChange: EventEmitter<Identifier[]> = new EventEmitter<Identifier[]>();
  @Input() @BooleanInput() public version: boolean | string;
  @ViewChild("form") public form?: NgForm;

  protected rowInstance: Identifier = {};

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected addOidIdentifier(): void {
    if (!this.identifiers) {
      return;
    }
    const oidIdentifier: Identifier = {
      system: 'urn:ietf:rfc:3986',
      value: 'urn:oid:'
    };
    this.identifiers = [...this.identifiers, oidIdentifier];
    this.identifiersChange.emit(this.identifiers);
  }

  protected trimWhitespace(identifier: Identifier, field: 'system' | 'value'): void {
    if (identifier[field]) {
      identifier[field] = identifier[field]!.trim();
    }
  }
}
