import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DesignationLibService} from '../../services/designation-lib.service';
import {DesignationSearchParams} from '../../model/designation-search-params';
import {Designation} from '../../model/designation';
import {BooleanInput, group, isDefined} from '@kodality-web/core-util';

@Component({
  selector: 'twl-designation-select',
  templateUrl: './designation-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DesignationSelectComponent), multi: true}]
})
export class DesignationSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public conceptId?: number;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;

  public data: {[id: string]: Designation} = {};
  public value?: number;
  public loading: boolean = false;

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private designationService: DesignationLibService
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["conceptId"].currentValue) {
      this.loadDesignations();
    }
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[this.value!]);
    }
  }

  public loadDesignations(): void {
    if (!this.conceptId) {
      return;
    }
    const q = new DesignationSearchParams();
    q.conceptId = this.conceptId;
    q.limit = 10_000;
    this.loading = true;
    this.designationService.search(q)
      .subscribe(da => this.data = group(da.data, designation => designation.id!))
      .add(() => this.loading = false);
  }

  public loadDesignation(id?: number): void {
    if (isDefined(id)) {
      this.loading = true;
      this.designationService.load(id).subscribe(d => this.data = {...this.data, [d.id!]: d}).add(() => this.loading = false);
    }
  }

  public writeValue(obj: Designation | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
    this.loadDesignation(this.value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
