import { Component, forwardRef, Input, OnInit, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined, KeysPipe } from '@termx-health/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {NamingSystem} from 'term-web/resources/_lib/naming-system/model/naming-system';
import {NamingSystemSearchParams} from 'term-web/resources/_lib/naming-system/model/naming-system-search-params';
import {NamingSystemLibService} from 'term-web/resources/_lib/naming-system/services/naming-system-lib.service';
import { MuiSelectModule } from '@termx-health/ui';



@Component({
    selector: 'tw-naming-system-search',
    templateUrl: './naming-system-search.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NamingSystemSearchComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, KeysPipe]
})
export class NamingSystemSearchComponent implements OnInit, ControlValueAccessor {
  private namingSystemLibService = inject(NamingSystemLibService);
  private destroy$ = inject(DestroyService);

  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: NamingSystem) => boolean;

  public data: {[id: string]: NamingSystem} = {};
  public value?: string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): any => x;
  public onTouched = (x: any): any => x;

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchNamingSystems(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchNamingSystems(text: string): Observable<{[id: string]: NamingSystem}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new NamingSystemSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.namingSystemLibService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadNamingSystem(id?: string): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.namingSystemLibService.load(id).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: NamingSystem | string): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadNamingSystem(this.value);
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
