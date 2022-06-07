import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DesignationLibService} from '../../services/designation-lib.service';
import {DesignationSearchParams} from '../../model/designation-search-params';
import {Designation} from '../../model/designation';
import {BooleanInput, group, isNil} from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'twl-designation-select',
  templateUrl: './designation-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DesignationSelectComponent), multi: true}]
})
export class DesignationSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public conceptId?: number;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() @BooleanInput() public multiple: string | boolean = false;

  public data: {[id: string]: Designation} = {};
  public value?: number | number[];
  public loading: boolean = false;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public constructor(
    private designationService: DesignationLibService
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["conceptId"]) {
      this.loadSelectData();
    }
  }

  public loadSelectData(): void {
    if (!this.conceptId) {
      this.data = {};
      this.value = undefined;
      return;
    }

    const q = new DesignationSearchParams();
    q.conceptId = this.conceptId;
    q.limit = 10_000;

    this.loading = true;
    this.designationService.search(q).subscribe(da => {
      this.data = group(da.data, designation => designation.id!);
    }).add(() => this.loading = false);
  }

  public loadDesignations(ids: number[]): void {
    ids = ids.filter(id => !this.data[id]);
    if (ids.length === 0) {
      return;
    }
    this.loading = true;
    // todo: add 'ids' param
    forkJoin(ids.map(id => this.designationService.load(id))).subscribe(resp => {
      resp.forEach(d => this.data = {...this.data, [d.id!]: d});
    }).add(() => this.loading = false);
  }

  public writeValue(obj: Designation | Designation[] | number | number[]): void {
    if (isNil(obj)) {
      this.value = undefined;
      return;
    }

    if (Array.isArray(obj)) {
      this.value = obj.map(o => typeof o === 'object' ? o?.id as number : o);
      this.loadDesignations(this.value);
    } else {
      this.value = typeof obj === 'object' ? obj?.id! : obj;
      this.loadDesignations([this.value]);
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
