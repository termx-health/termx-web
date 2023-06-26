import {Component, forwardRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import {BooleanInput, DestroyService, isDefined, validateForm} from '@kodality-web/core-util';
import {EntityProperty} from 'term-web/resources/_lib';


@Component({
  selector: 'tw-property-value-input',
  templateUrl: './entity-property-value-input.component.html',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EntityPropertyValueInputComponent), multi: true},
    DestroyService
  ]
})
export class EntityPropertyValueInputComponent implements OnChanges, ControlValueAccessor {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() @BooleanInput() public required: boolean | string = false;
  @Input() public codeSystem?: string;
  @Input() public property?: EntityProperty;

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

  protected getFilterPropertyValues = (property: EntityProperty): string => {
    return property.rule?.filters
      ?.filter(f => (isDefined(f.property?.name) || isDefined(f.association)) && isDefined(f.value))
      ?.map(f => (f.property?.name || f.association) + '|' + (f.value?.code || f.value))
      .join(';');
  };

  private prepareValue(property: EntityProperty): void {
    if (property?.type === 'Coding') {
      this.value ??= {};
    }
  }
}
