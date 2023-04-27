import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {CodeSystemConcept, CodeSystemConceptLibService, ConceptSearchParams, ConceptUtil} from '../../codesystem';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'tw-concept-search',
  templateUrl: './concept-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ConceptSearchComponent), multi: true}, DestroyService]
})
export class ConceptSearchComponent implements OnInit, OnChanges, ControlValueAccessor {
  private static complex_code_systems = ['loinc', 'loinc-answer-list'];

  @Input() public valueType: 'id' | 'code' | 'full' = 'full';
  @Input() @BooleanInput() public multiple: string | boolean;

  @Input() public codeSystem?: string;
  @Input() public codeSystemVersion?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public codeSystemVersionReleaseDateLe?: Date;
  @Input() public codeSystemVersionExpirationDateGe?: Date;
  @Input() public codeSystemEntityVersionStatus?: string;

  public data: {[id: string]: CodeSystemConcept} = {};
  public value?: number | number[] | string | string[];
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private conceptService: CodeSystemConceptLibService,
    private translateService: TranslateService,
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
    if (!isDefined(this.codeSystem)) {
      return of(this.data);
    }
    if (ConceptSearchComponent.complex_code_systems.includes(this.codeSystem) && (!text || text.length < 2)) {
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
    q.limit = 100;

    this.loading['search'] = true;
    return this.conceptService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => ({...this.data, ...group(ca.data, c => this.valueType === 'code' ? c.code! : c.id!)})),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadConcept(val: number | string, isIdArray?: boolean): void {
    if (isDefined(val) && typeof val === 'number') {
      this.loading['load'] = true;
      this.conceptService.load(val).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [this.valueType === 'code' ? c.code! : c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }

    if (isDefined(val) && typeof val === 'string') {
      this.loading['load'] = true;
      this.conceptService.search(
        {id: isIdArray ? val : undefined, code: !isIdArray ? val : undefined, limit: val.split(',').length, codeSystem: this.codeSystem})
        .pipe(takeUntil(this.destroy$)).subscribe(c => {
        const data = group(c.data, d => this.valueType === 'code' ? d.code! : d.id!);
        this.data = {...(this.data || {}), ...data};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: CodeSystemConcept | number | string): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(o => typeof o === 'object' ? o?.code : o);
      this.loadConcept(this.value.join(','), typeof this.value?.[0] === 'number');
    } else {
      this.value = (typeof obj === 'object' ? obj?.id : obj);
      this.loadConcept(this.value);
    }
  }

  public fireOnChange(): void {
    if (this.valueType === 'id' || this.valueType === 'code') {
      this.onChange(this.value);
    } else {
      const v = Array.isArray(this.value) ? this.value.map(v => this.data?.[v]) : this.data?.[this.value];
      this.onChange(v);
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

  protected getDisplay = (concept: CodeSystemConcept): string => {
    const lang = this.translateService.currentLang;
    return ConceptUtil.getDisplay(concept, lang);
  };
}
