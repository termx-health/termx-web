import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {catchError, finalize, map, of, takeUntil} from 'rxjs';
import {AssociationTypeLibService} from '../services/association-type-lib.service';
import {AssociationTypeSearchParams} from '../model/association-type-search-params';
import {AssociationType} from '../model/association-type';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';

@Component({
  selector: 'twl-association-type-search',
  templateUrl: './association-type-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AssociationTypeSearchComponent), multi: true}, DestroyService]
})
export class AssociationTypeSearchComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: AssociationType) => boolean;

  public data: {[code: string]: AssociationType} = {};
  public value?: string;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private associationTypeService: AssociationTypeLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.loadTypes();
  }

  private loadTypes(): void {
    const q = new AssociationTypeSearchParams();
    q.limit = 10_000;

    this.loading['search'] = true;
    this.associationTypeService.search(q).pipe(
      takeUntil(this.destroy$),
      map(tr => group(tr.data, t => t.code!)),
      catchError(() => of(this.data!)),
      finalize(() => this.loading['search'] = false)
    ).subscribe(data => this.data = data);
  }

  private loadAssociationType(code?: string): void {
    if (isDefined(code)) {
      this.loading['load'] = true;
      this.associationTypeService.load(code).pipe(takeUntil(this.destroy$)).subscribe(a => {
        this.data = {[a.code!]: a};
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: AssociationType | string): void {
    this.value = typeof obj === 'object' ? obj?.code : obj;
    this.loadAssociationType(this.value);
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
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

  public filterOption = (_input: string, {nzValue}: NzSelectItemInterface): boolean => {
    return !this.filter || this.filter(this.data[nzValue]);
  };

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
