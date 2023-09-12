import {Component, forwardRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import {BooleanInput, DestroyService, isDefined, validateForm} from '@kodality-web/core-util';
import {EntityProperty, MapSetProperty} from 'term-web/resources/_lib';


@Component({
  selector: 'tw-map-set-property-value-input',
  templateUrl: './map-set-property-value-input.component.html',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MapSetPropertyValueInputComponent), multi: true},
    DestroyService
  ]
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
