import {Component, Input, ViewChild} from '@angular/core';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ValueSetVersionRule} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-value-set-rule-form',
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
