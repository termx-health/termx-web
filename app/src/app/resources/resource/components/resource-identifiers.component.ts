import {Component, Input, ViewChild} from '@angular/core';
import {Identifier, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-resource-identifiers',
  templateUrl: './resource-identifiers.component.html',
})
export class ResourceIdentifiersComponent {
  @Input() public identifiers?: Identifier[];
  @ViewChild("form") public form?: NgForm;

  protected rowInstance: Identifier = {};

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
