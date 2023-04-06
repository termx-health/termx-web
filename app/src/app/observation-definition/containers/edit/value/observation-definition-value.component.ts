import {Component, Input, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ObservationDefinitionValue} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-value',
  templateUrl: './observation-definition-value.component.html',
})
export class ObservationDefinitionValueComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public value!: ObservationDefinitionValue;

  @ViewChild("form") public form?: NgForm;

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
