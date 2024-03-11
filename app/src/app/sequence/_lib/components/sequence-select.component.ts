import {Component, forwardRef, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DestroyService, group, LoadingManager} from '@kodality-web/core-util';
import {catchError, EMPTY, map, Observable, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {SequenceSearchParams} from 'term-web/sequence/_lib/models/sequence-search-params';
import {SequenceLibService} from 'term-web/sequence/_lib/services/sequence-lib.service';
import {Sequence} from '../models/sequence';

@Component({
  selector: 'tw-sequence-select',
  template: `
    <m-select
        icon="search"
        placeholder="marina.ui.inputs.select.placeholder"
        [(ngModel)]="val"
        (mInputChange)="searchUpdate.next($event)"
        (mChange)="fireOnChange()"
        [loading]="loader.isLoading"
        [autoUnselect]="false"
    >
      <m-option *ngFor="let key of data | keys" [mValue]="data[key].code" [mLabel]="data[key].description || data[key].code"></m-option>
    </m-select>
  `,
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SequenceSelectComponent), multi: true},
    DestroyService,
  ]
})
export class SequenceSelectComponent implements OnInit, ControlValueAccessor {
  protected data: {[id: number]: Sequence} = {};
  protected loader = new LoadingManager();
  protected searchUpdate = new Subject<string>();

  protected val: string;
  private onChange = (x: any): void => x;
  private onTouched = (x: any): void => x;

  public constructor(
    private sequenceService: SequenceLibService,
    private destroy$: DestroyService
  ) { }

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      takeUntil(this.destroy$),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchSequences(text)),
    ).subscribe(data => this.data = data);
  }


  private searchSequences(text: string): Observable<{[id: number]: Sequence}> {
    if (!text || text.length < 1) {
      return EMPTY;
    }

    const q = new SequenceSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    return this.loader.wrap('search', this.sequenceService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => EMPTY),
    ));
  }

  private loadSequence(code: string): void {
    const req$ = this.sequenceService
      .search({codes: code, limit: 1})
      .pipe(takeUntil(this.destroy$));

    this.loader.wrap('load', req$).subscribe(resp => {
      this.data = {
        ...(this.data || {}),
        ...group(resp.data, m => m.id)
      };
    });
  }


  public writeValue(code: string): void {
    this.val = code;

    if (code) {
      this.loadSequence(code);
    }
  }

  public fireOnChange(): void {
    this.onChange(this.val);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
