import {Component, Input, ViewChild} from '@angular/core';
import {ValueSetVersionRule} from 'lib/src/resources';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-value-set-rule-form',
  templateUrl: 'value-set-rule-form.component.html',
})
export class ValueSetRuleFormComponent {
  @Input() public rule?: ValueSetVersionRule;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  public constructor() {}

  public validate(): boolean {
    return validateForm(this.form);
  }
}
