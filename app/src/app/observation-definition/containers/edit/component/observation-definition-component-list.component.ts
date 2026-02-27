import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {ObservationDefinitionComponent} from 'term-web/observation-definition/_lib';
import { MuiEditableTableModule, MuiTableModule, MuiFormModule, MuiInputModule, MuiNumberInputModule, MuiMultiLanguageInputModule } from '@kodality-web/marina-ui';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    selector: 'tw-obs-def-component-list',
    templateUrl: './observation-definition-component-list.component.html',
    imports: [
        FormsModule,
        MuiEditableTableModule,
        MuiTableModule,
        MuiFormModule,
        MuiInputModule,
        MuiNumberInputModule,
        MuiMultiLanguageInputModule,
        ValueSetConceptSelectComponent,
        CodeSystemSearchComponent,
        TerminologyConceptSearchComponent,
        ValueSetSearchComponent,
        MarinaUtilModule,
    ],
})
export class ObservationDefinitionComponentListComponent implements OnChanges{
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public components!: ObservationDefinitionComponent[];

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionComponent = {cardinality: {}, unit: {}};

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['components'] && this.components) {
      this.components.forEach(c => {
        c.cardinality ??= {};
        c.unit ??= {};
      });
    }
  }

  protected clearBinding(component: ObservationDefinitionComponent, type: string): void {
    component.unit = {};
    component.valueSet = undefined;

    if (type === 'Quantity') {
      component.unit = {system: 'ucum'};
    }
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
