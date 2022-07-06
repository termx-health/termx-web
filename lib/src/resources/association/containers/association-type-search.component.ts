import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {catchError, finalize, map, Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {AssociationTypeLibService} from '../services/association-type-lib.service';
import {AssociationTypeSearchParams} from '../model/association-type-search-params';
import {AssociationType} from '../model/association-type';
import {BooleanInput, group, isDefined} from '@kodality-web/core-util';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'twl-association-type-search',
  templateUrl: './association-type-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AssociationTypeSearchComponent), multi: true}]
})
export class AssociationTypeSearchComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;


  public data?: {[code: string]: AssociationType} = {};
  public value?: string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private associationTypeService: AssociationTypeLibService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchTypes(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchTypes(text: string): Observable<{[code: string]: AssociationType}> {
    if (!text || text.length === 1) {
      return of(this.data!);
    }

    const q = new AssociationTypeSearchParams();
    q.codeContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.associationTypeService.searchTypes(q).pipe(
      map(tr => group(tr.data, t => t.code!)),
      catchError(() => of(this.data!)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadAssociationType(code?: string): void {
    if (isDefined(code)) {
      this.loading['load'] = true;
      this.associationTypeService.load(code).subscribe(a => {
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


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
