import {Component, forwardRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, isDefined, validateForm, ApplyPipe, IncludesPipe, LocalDatePipe, ToBooleanPipe } from '@termx-health/core-util';
import {EntityProperty, MapSetProperty} from 'term-web/resources/_lib';
import { MuiFormModule, MuiInputModule, MuiCheckboxModule, MuiDatePickerModule, MuiNumberInputModule, MuiSelectModule } from '@termx-health/ui';
import { AsyncPipe } from '@angular/common';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';


@Component({
    selector: 'tw-map-set-property-value-input',
    templateUrl: './map-set-property-value-input.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MapSetPropertyValueInputComponent), multi: true },
        DestroyService
    ],
    imports: [FormsModule, MuiFormModule, MuiInputModule, MuiCheckboxModule, MuiDatePickerModule, MuiNumberInputModule, CodeSystemSearchComponent, TerminologyConceptSearchComponent, MuiSelectModule, ValueSetConceptSelectComponent, AsyncPipe, ApplyPipe, IncludesPipe, LocalDatePipe, ToBooleanPipe, LocalizedConceptNamePipe]
})
export class MapSetPropertyValueInputComponent implements OnChanges, ControlValueAccessor {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() @BooleanInput() public required: boolean | string = false;
  @Input() public property?: MapSetProperty;

  @ViewChild("form") public form?: NgForm;

  public value?: any;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.prepareValue(this.property);
    }
  }

  public writeValue(obj: any): void {
    this.value = obj;
  }

  public fireOnChange(): void {
    this.onChange(this.value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public valid(): boolean {
    return validateForm(this.form);
  }

  protected codingType = (property: EntityProperty): string => {
    if (isDefined(property?.rule?.valueSet)) {
      return 'value-set';
    }
    if (property?.rule?.codeSystems?.length > 0) {
      return 'code-system';
    }
    return 'undefined';
  };

  private prepareValue(property: MapSetProperty): void {
    if (property?.type === 'Coding') {
      this.value ??= {};
    }
  }
}
