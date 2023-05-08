import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, isDefined} from '@kodality-web/core-util';
import {EntityProperty} from 'term-web/resources/_lib';


@Component({
  selector: 'tw-property-value-input',
  templateUrl: './entity-property-value-input.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EntityPropertyValueInputComponent), multi: true}, DestroyService]
})
export class EntityPropertyValueInputComponent implements ControlValueAccessor {
  @Input() @BooleanInput() public viewMode: boolean | string = false;

  @Input() public codeSystem?: string;
  @Input() public property?: EntityProperty;

  public value?: any;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public constructor() {}

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

  protected codingType = (property: EntityProperty): string => {
    if (isDefined(property?.rule?.valueSet)) {
      return 'value-set';
    }
    if (property?.rule?.codeSystems?.length > 0) {
      return 'code-system';
    }
    return 'undefined';
  };
}
