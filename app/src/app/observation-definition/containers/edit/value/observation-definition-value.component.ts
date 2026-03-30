import {Component, Input, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@termx-health/core-util';
import {ObservationDefinitionValue} from 'term-web/observation-definition/_lib';

import { MuiFormModule, MuiSelectModule, MuiCheckboxModule, MuiTextareaModule } from '@termx-health/ui';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { ObservationDefinitionValueSelectComponent } from 'term-web/observation-definition/_lib/components/observation-definition-value-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-obs-def-value',
    templateUrl: './observation-definition-value.component.html',
    imports: [
    FormsModule,
    MuiFormModule,
    ValueSetConceptSelectComponent,
    MuiSelectModule,
    ValueSetSearchComponent,
    ObservationDefinitionValueSelectComponent,
    CodeSystemSearchComponent,
    TerminologyConceptSearchComponent,
    MuiCheckboxModule,
    MuiTextareaModule,
    TranslatePipe
],
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
