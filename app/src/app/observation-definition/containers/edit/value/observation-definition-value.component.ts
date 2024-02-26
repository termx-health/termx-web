import {Component, Input, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
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

  protected clearBinding(type: string): void {
    this.value.unit = {};
    this.value.valueSet = undefined;
    this.value.usage = undefined;
    this.value.values = undefined;

    if (type === 'Quantity') {
      this.value.unit = {system: 'ucum'};
    }

    if (type === 'CodeableConcept') {
      this.value.usage = 'not-in-use';
    }
  }
}
