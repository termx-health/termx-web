import {Component, Input, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, Identifier, isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'tw-resource-identifiers',
  templateUrl: './resource-identifiers.component.html',
})
export class ResourceIdentifiersComponent {
  @Input() public identifiers?: Identifier[];
  @Input() @BooleanInput() public version: boolean | string;
  @ViewChild("form") public form?: NgForm;

  protected rowInstance: Identifier = {};

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
