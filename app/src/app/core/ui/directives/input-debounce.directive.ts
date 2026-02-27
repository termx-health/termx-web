import { Directive, Input, inject } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NgControl} from '@angular/forms';
import {catchError, debounceTime, distinctUntilChanged, EMPTY, filter, Observable, skip, Subject, switchMap} from 'rxjs';

@Directive({ selector: 'm-input[twDebounce], input[twDebounce]' })
export class InputDebounceDirective {
  private ngControl = inject(NgControl, { optional: true, self: true });

  @Input() public debounce = 250;
  @Input() public debounced: (text?: string) => Observable<any> = () => EMPTY;

  public constructor() {
    const ngControl = this.ngControl;

    const search$ = new Subject<string>();
    search$.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
      switchMap(e => this.debounced(e).pipe(catchError(() => EMPTY))),
    ).subscribe();

    if (this.ngControl) {
      this.ngControl.valueChanges.pipe(takeUntilDestroyed(), skip(1), filter(() => !ngControl.disabled)).subscribe(e => search$.next(e));
    } else {
      // eslint-disable-next-line no-console
      console.error("Couldn't initialize 'twDebounce' pipe, no NgControl!");
    }
  }
}
