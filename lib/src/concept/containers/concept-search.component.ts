import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, finalize, map, Observable, of, tap} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {group, isDefined} from '@kodality-web/core-util';
import {Concept} from '../services/concept';
import {ConceptSearchParams} from '../services/concept-search-params';
import {ConceptLibService} from '../services/concept-lib.service';

@Component({
  selector: 'twl-concept-search',
  templateUrl: './concept-search.component.html',
  styles: [
    `::ng-deep .twa-concept-search  .ant-select {
        width: 100%
    }`
  ],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ConceptSearchComponent), multi: true}]
})
export class ConceptSearchComponent implements ControlValueAccessor {
  @Input() public valuePrimitive: boolean = false;
  @Input() public placeholder: string = 'marina.ui.components.search.placeholder';

  public searchUpdate: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public compareWith = (o1: unknown, o2: unknown): boolean => o1 == o2;

  public data?: {[id: string]: Concept};
  public value?: number;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;


  public constructor(
    private conceptService: ConceptLibService,
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(debounceTime(250), distinctUntilChanged(), switchMap(text => this.searchConcepts(text))).subscribe();
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  public searchConcepts(text: string): Observable<void> {
    if (!text || text.length < 1) {
      return of(undefined);
    }
    const q = new ConceptSearchParams();
    q.codeContains = text;
    q.limit = 10_000;
    this.loading['search'] = true;
    return this.conceptService.search(q).pipe(
      tap(ca => this.data = group(ca.data, c => c.id!)),
      map(() => undefined),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadConcept(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.conceptService.load(id).subscribe(c => this.data = {...(this.data || {}), [c.id!]: c}).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: Concept | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
    this.loadConcept(this.value);
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
