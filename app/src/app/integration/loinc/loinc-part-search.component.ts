import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, compareValues, DestroyService, group, isDefined, LoadingManager, ApplyPipe, FirstPipe, KeysPipe, ToBooleanPipe } from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams} from 'term-web/resources/_lib';

import { MuiSelectModule } from '@kodality-web/marina-ui';


@Component({
    selector: 'tw-loinc-part-search',
    templateUrl: './loinc-part-search.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LoincPartSearchComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, ApplyPipe, FirstPipe, KeysPipe, ToBooleanPipe]
})
export class LoincPartSearchComponent implements OnInit, OnChanges, ControlValueAccessor {
  private codeSystemService = inject(CodeSystemLibService);
  private translateService = inject(TranslateService);
  private destroy$ = inject(DestroyService);

  @Input() public type: string;

  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() public mode: 'search' | 'select' = 'search';
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  protected loader = new LoadingManager();

  protected data: {[code: string]: CodeSystemConcept} = {};
  protected value?: string | string[];
  protected searchUpdate = new Subject<string>();

  public onChange = (x: any): any => x;
  public onTouched = (x: any): any => x;

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchParts(text)),
    ).subscribe(data => this.data = data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] && this.mode === 'select') {
      this.searchParts(undefined, true).subscribe(data => this.data = data);
    }
  }

  protected onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchParts(text: string, allowEmptyText: boolean = false): Observable<{[id: string]: CodeSystemConcept}> {
    if (!allowEmptyText && (!text || text.length < 1 || !this.type)) {
      return of(this.data);
    }

    const q = new ConceptSearchParams();
    q.textContains = text;
    q.propertyValues = 'type|' + this.type;
    q.limit = 10_000;

    return this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc-part', q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.code!)),
      catchError(() => of(this.data))
    ));
  }

  private loadParts(code?: string): void {
    if (isDefined(code)) {
      this.loader.wrap('load', this.codeSystemService.searchConcepts('loinc-part', {code: code})
        .pipe(takeUntil(this.destroy$))).subscribe(resp => {
        this.data = {...(this.data || {}), ...group(resp.data, c => c.id)};
      });
    }
  }

  protected getCodeName = (c: CodeSystemConcept): string => {
    const version = this.getLastVersion(c.versions);
    const displays = version.designations.filter(d => d.designationType === 'display');
    const display = displays.find(d => d.language === this.translateService.currentLang);
    return c.code + ' ' + (display ? display.name : displays[0]?.name);
  };

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  public writeValue(obj: CodeSystemConcept | CodeSystemConcept[] | string | string[]): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(p => typeof p === 'object' ? p?.code : p);
      this.loadParts(this.value.join(','));
    } else {
      this.value = typeof obj === 'object' ? obj?.code : obj;
      this.loadParts(this.value);
    }
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      const v = Array.isArray(this.value) ? this.value.map(code => this.data?.[code]) : this.data?.[this.value];
      this.onChange(v);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
