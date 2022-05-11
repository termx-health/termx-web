import {Component, ElementRef, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, finalize, map, Observable, of, tap} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {findFocusableElement, group, isDefined} from '@kodality-web/core-util';
import {Concept} from '../../codesystem/services/concept';
import {ConceptSearchParams} from '../services/concept-search-params';
import {ConceptLibService} from '../services/concept-lib.service';

@Component({
  selector: 'twl-concept-search-input',
  templateUrl: './concept-search-input.component.html',
  styles: [
    `::ng-deep .ant-select {
        width: 100%
    }`
  ],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ConceptSearchInputComponent), multi: true}]
})
export class ConceptSearchInputComponent implements ControlValueAccessor {
  @Input() public compareWith = (o1: unknown, o2: unknown) => o1 == o2;
  @Input() public valuePrimitive: boolean = false;
  @Input() public placeholder: string = 'marina.ui.components.search.placeholder';


  public data?: {[id: string]: Concept};
  public loading?: boolean;
  public value?: number;
  public searchUpdate: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;


  public constructor(
    private elementRef: ElementRef,
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
    this.loading = true;
    const q = new ConceptSearchParams();
    q.codeContains = text;
    return this.conceptService.search(q).pipe(
      tap(ca => this.data = group(ca.data, c => c.id!)),
      map(() => undefined),
      finalize(() => this.loading = false)
    );
  }

  private loadConcept(id: number): void {
    if (isDefined(id)) {
      this.conceptService.load(id).subscribe(c => this.data = {...(this.data || {}), [c.id!]: c});
    }
  }

  public writeValue(obj: Concept | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj) as number;
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

  public focus(): void {
    findFocusableElement(this.elementRef.nativeElement).focus();
  }

}
