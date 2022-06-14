import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, group, isNil} from '@kodality-web/core-util';
import {ValueSetConcept} from '../model/value-set-version';
import {ValueSetLibService} from '../services/value-set-lib.service';
import {CodeSystemConcept, CodeSystemConceptLibService} from '../../codesystem';

@Component({
  selector: 'twl-value-set-concept-select',
  templateUrl: './value-set-concept-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ValueSetConceptSelectComponent), multi: true}]
})
export class ValueSetConceptSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public valueSet!: string;
  @Input() public valueSetVersion!: string;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() @BooleanInput() public multiple: string | boolean = false;

  public data: {[conceptCode: string]: ValueSetConcept} = {};
  public value?: string | string[];
  public loading: boolean = false;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public constructor(private valueSetService: ValueSetLibService, private conceptService: CodeSystemConceptLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSet"] || changes["valueSetVersion"]) {
      this.loadConcepts();
    }
  }

  public loadConcepts(): void {
    if (!this.valueSet) {
      this.value = undefined;
      this.data = {};
      return;
    }

    this.loading = true;
    const request = !this.valueSetVersion ? this.valueSetService.expand(this.valueSet) :
      this.valueSetService.expandByVersion(this.valueSet, this.valueSetVersion);
    request.subscribe(concepts => {
      this.data = group(concepts, c => c.concept!.code!);
    }).add(() => this.loading = false);
  }

  public loadConcept(codes: string[]): void {
    codes = codes.filter(code => !this.data[code]);
    if (codes.length === 0) {
      return;
    }
    this.loading = true;
    this.conceptService.search({code: codes.join(","), limit: 1}).subscribe(r => {
      r.data.forEach(c => this.data[c.code!] = {concept: c});
    }).add(() => this.loading = false);

  }

  public writeValue(obj: CodeSystemConcept | CodeSystemConcept[] | string | string[]): void {
    if (isNil(obj)) {
      this.value = undefined;
      return;
    }

    if (Array.isArray(obj)) {
      this.value = obj.map(o => typeof o === 'object' ? o?.code! : o);
      this.loadConcept(this.value);
    } else {
      this.value = typeof obj === 'object' ? obj?.code! : obj;
      this.loadConcept([this.value]);
    }
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
      return;
    }

    if (Array.isArray(this.value)) {
      this.onChange(this.value.map(id => this.data[id]).filter(Boolean));
    } else {
      this.onChange(this.data?.[this.value!]);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}