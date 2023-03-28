import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DestroyService, group, isDefined} from '@kodality-web/core-util';
import {CodeSystemConcept, CodeSystemConceptLibService, ConceptSearchParams} from '../../codesystem';

@Component({
  selector: 'tw-concept-search',
  templateUrl: './concept-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ConceptSearchComponent), multi: true}, DestroyService]
})
export class ConceptSearchComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() public codeSystem?: string;
  @Input() public codeSystemVersion?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public codeSystemVersionReleaseDateLe?: Date;
  @Input() public codeSystemVersionExpirationDateGe?: Date;
  @Input() public codeSystemEntityVersionStatus?: string;
  @Input() public valueType: 'id' | 'code' | 'full' = 'full';

  public data: {[id: string]: CodeSystemConcept} = {};
  public value?: number | string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private conceptService: CodeSystemConceptLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchConcepts(text)),
    ).subscribe(data => this.data = data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystem"]
      || changes["codeSystemVersion"]
      || changes["codeSystemVersionReleaseDateLe"]
      || changes["codeSystemVersionExpirationDateGe"]
      || changes["entityVersionStatus"]
    ) {
      this.data = {};
      this.searchUpdate.next('');
    }
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  public searchConcepts(text?: string): Observable<{[id: string]: CodeSystemConcept}> {
    if ((!text || text.length < 1) && !this.codeSystem && !this.codeSystemVersion) {
      return of(this.data);
    }

    const q = new ConceptSearchParams();
    q.codeContains = text;
    q.codeSystem = this.codeSystem;
    q.codeSystemVersion = this.codeSystemVersion;
    q.codeSystemVersionId = this.codeSystemVersionId;
    q.codeSystemVersionReleaseDateLe = this.codeSystemVersionReleaseDateLe;
    q.codeSystemVersionExpirationDateGe = this.codeSystemVersionExpirationDateGe;
    q.codeSystemEntityStatus = this.codeSystemEntityVersionStatus;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.conceptService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => ({...this.data, ...group(ca.data, c => this.valueType === 'code' ? c.code! : c.id!)})),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadConcept(val?: number | string): void {
    if (isDefined(val) && typeof val === 'number') {
      this.loading['load'] = true;
      this.conceptService.load(val).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [this.valueType === 'code' ? c.code! : c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }

    if (isDefined(val) && typeof val === 'string') {
      this.loading['load'] = true;
      this.conceptService.search({code: val, limit: 1, codeSystem: this.codeSystem}).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.data[0].code!]: c.data[0]};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: CodeSystemConcept | number | string): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
    this.loadConcept(this.value);
  }

  public fireOnChange(): void {
    if (this.valueType === 'id' || this.valueType === 'code') {
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
