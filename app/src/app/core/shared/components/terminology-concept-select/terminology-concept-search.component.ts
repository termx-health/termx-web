import {Component, forwardRef, Input} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {CodeSystemConcept} from 'term-web/resources/_lib';
import {MeasurementUnit} from 'term-web/measurement-unit/_lib';

@Component({
  selector: 'tw-term-concept-search',
  templateUrl: './terminology-concept-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TerminologyConceptSearchComponent), multi: true}]
})
export class TerminologyConceptSearchComponent {
  @Input() public valueType: 'id' | 'code' | 'full' = 'full';

  @Input() public codeSystem?: string;
  @Input() public codeSystemVersion?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public codeSystemVersionReleaseDateLe?: Date;
  @Input() public codeSystemVersionExpirationDateGe?: Date;
  @Input() public codeSystemEntityVersionStatus?: string;

  public value?: CodeSystemConcept | number | string;

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor() {}

  public writeValue(obj: CodeSystemConcept | number | string): void {
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

  protected fromUcum = (value: MeasurementUnit | string): CodeSystemConcept | string => {
    if (typeof value === 'object') {
      const designations = [
        ...Object.keys(value.names).map(lang => ({language: lang, name: value.names[lang], designationType: 'display'})),
        ...Object.keys(value.alias).map(lang => ({language: lang, name: value.alias[lang], designationType: 'alias'}))
      ];
      return {code: value.code, codeSystem: 'ucum', versions: [{designations: designations}]};
    }
    return value;
  };

  protected fromSnomed = (value: string): CodeSystemConcept | string => {
    if (this.valueType === 'full') {
      this.value = {code: value, codeSystem: 'snomed-ct', versions: [{designations: []}]};
    } else {
      this.value = value;
    }
    return this.value;
  };

  protected valuePrimitive = (type: 'id' | 'code' | 'full'): boolean => {
    return type != 'full';
  };

  protected getCode = (value: CodeSystemConcept | string): string => {
    if (typeof value === 'object') {
      return value.code;
    }
    return value;
  };

}
