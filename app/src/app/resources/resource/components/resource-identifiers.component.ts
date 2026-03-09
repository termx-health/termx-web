import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, Identifier, isDefined, validateForm} from '@kodality-web/core-util';
import { MuiCardModule, MuiDropdownModule, MuiCoreModule, MuiEditableTableModule, MuiInputModule } from '@kodality-web/marina-ui';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-resource-identifiers',
    templateUrl: './resource-identifiers.component.html',
    imports: [
        MuiCardModule,
        MuiDropdownModule,
        AddButtonComponent,
        MuiCoreModule,
        FormsModule,
        MuiEditableTableModule,
        MuiInputModule,
        TranslatePipe,
    ],
})
export class ResourceIdentifiersComponent {
  @Input() public identifiers?: Identifier[];
  @Output() public identifiersChange: EventEmitter<Identifier[]> = new EventEmitter<Identifier[]>();
  @Input() @BooleanInput() public version: boolean | string;
  @Input() @BooleanInput() public viewMode: boolean | string = false;
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
