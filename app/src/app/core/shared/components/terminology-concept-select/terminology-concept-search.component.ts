import {Component, forwardRef, Input} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {CodeSystemConcept} from 'term-web/resources/_lib';
import {MeasurementUnit} from 'term-web/measurement-unit/_lib';
import {BooleanInput} from '@kodality-web/core-util';
import {SnomedLibService} from 'term-web/integration/_lib';

@Component({
  selector: 'tw-term-concept-search',
  templateUrl: './terminology-concept-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TerminologyConceptSearchComponent), multi: true}]
})
export class TerminologyConceptSearchComponent {
  @Input() public valueType: 'id' | 'code' | 'full' = 'full';
  @Input() public displayType: 'code' | 'name' | 'codeName' = 'codeName';
  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.select.placeholder';

  @Input() public codeSystem?: string;
  @Input() public codeSystemVersion?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public codeSystemVersionReleaseDateLe?: Date;
  @Input() public codeSystemVersionExpirationDateGe?: Date;
  @Input() public codeSystemEntityVersionStatus?: string;
  @Input() public propertyValues?: string;

  public value?: CodeSystemConcept | number | string;

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(private snomedService: SnomedLibService) {}

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

  protected fromUcum = (value: MeasurementUnit | MeasurementUnit[] | string | string[]): void => {
    if (Array.isArray(value)) {
      this.onChange(value.map(v => this.mapUcum(v)));
    } else {
      this.onChange(this.mapUcum(value));
    }
  };

  protected mapUcum = (value: MeasurementUnit | string): CodeSystemConcept | string => {
    if (typeof value === 'object') {
      const designations = [
        ...Object.keys(value.names).map(lang => ({language: lang, name: value.names[lang], designationType: 'display'})),
        ...Object.keys(value.alias).map(lang => ({language: lang, name: value.alias[lang], designationType: 'alias'}))
      ];
      return {code: value.code, codeSystem: 'ucum', versions: [{designations: designations}]};
    }
    return value;
  };

  protected fromSnomed = (value: string): void => {
    if (this.valueType === 'full') {
      this.snomedService.loadConcept(value).subscribe(c => {
        this.value = {code: c.conceptId, codeSystem: 'snomed-ct', versions: [{designations: [{language: c.pt.lang, name: c.pt.term}]}]};
        this.onChange(this.value);
      });
    } else {
      this.value = value;
      this.onChange(this.value);
    }
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
