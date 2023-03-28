import {Component, Input, ViewChild} from '@angular/core';
import {EntityProperty} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'tw-code-system-property-form',
  templateUrl: './code-system-property-form.component.html',
})
export class CodeSystemPropertyFormComponent {
  @Input() public property?: EntityProperty;
  @ViewChild("form") public form?: NgForm;

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
