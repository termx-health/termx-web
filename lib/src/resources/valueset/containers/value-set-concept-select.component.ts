import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isNil} from '@kodality-web/core-util';
import {ValueSetLibService} from '../services/value-set-lib.service';
import {CodeSystemConcept, CodeSystemConceptLibService} from '../../codesystem';
import {takeUntil} from 'rxjs';
import {ValueSetVersionConcept} from '../model/value-set-version-concept';

@Component({
  selector: 'twl-value-set-concept-select',
  templateUrl: './value-set-concept-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ValueSetConceptSelectComponent), multi: true}, DestroyService]
})
export class ValueSetConceptSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public valueSet!: string;
  @Input() public valueSetVersion!: string;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() @BooleanInput() public multiple: string | boolean = false;

  public data: {[conceptCode: string]: ValueSetVersionConcept} = {};
  public value?: string | string[];
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public constructor(
    private valueSetService: ValueSetLibService,
    private conceptService: CodeSystemConceptLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSet"] || changes["valueSetVersion"]) {
      this.loadConcepts();
    }
  }

  private loadConcepts(): void {
    if (!this.valueSet) {
      this.value = undefined;
      this.data = {};
      return;
    }
    this.loading['select'] = true;
    this.valueSetService.expand({valueSet: this.valueSet, valueSetVersion: this.valueSetVersion}).pipe(takeUntil(this.destroy$)).subscribe(concepts => {
      this.data = group(concepts, c => c.concept!.code!);
    }).add(() => this.loading['select'] = false);
  }

  private loadConcept(codes: string[]): void {
    codes = codes.filter(code => !this.data[code]);
    if (codes.length === 0) {
      return;
    }

    this.loading['load'] = true;
    this.conceptService.search({code: codes.join(","), limit: 1}).pipe(takeUntil(this.destroy$)).subscribe(r => {
      r.data.forEach(c => this.data[c.code!] = {concept: c});
    }).add(() => this.loading['load'] = false);
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


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
