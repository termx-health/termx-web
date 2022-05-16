import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DesignationLibService} from '../../services/designation-lib.service';
import {DesignationSearchParams} from '../../model/designation-search-params';
import {Designation} from '../../model/designation';
import {catchError, finalize, map, of} from 'rxjs';
import {BooleanInput, group} from '@kodality-web/core-util';

@Component({
  selector: 'twl-designation-select',
  templateUrl: './designation-select.component.html',
  styles: [
    `::ng-deep .tw-designation-select .ant-select {
        width: 100%
    }`
  ],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DesignationSelectComponent), multi: true}]
})
export class DesignationSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public conceptId?: number;
  @Input() @BooleanInput() public autoUnselect?: string | boolean = false;

  public data: {[id: string]: Designation} = {};
  public value?: number;
  public loading: boolean = false;
  public defaultValue?: string;
  public compareWith = (o1: unknown, o2: unknown): boolean => o1 == o2;


  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private designationService: DesignationLibService
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["conceptId"].currentValue){
      this.loadDesignations();
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
    this.designationService.search(q).pipe(
      map(da => { return group(da.data, d => d.id!);}),
      catchError(() => of(this.data)),
      finalize(() => this.loading = false)
    ).subscribe(da => this.data = da).add(() => this.loading = false);
  }

  public writeValue(obj: Designation | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
