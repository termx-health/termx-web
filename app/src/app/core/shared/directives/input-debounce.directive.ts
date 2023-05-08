import {Directive, Input, OnInit} from '@angular/core';
import {catchError, debounceTime, distinctUntilChanged, EMPTY, Observable, Subject, switchMap} from 'rxjs';
import {MuiInputComponent} from '@kodality-web/marina-ui';

@Directive({
  selector: 'm-input[twDebounce]'
})
export class InputDebounceDirective implements OnInit {
  @Input() public debounce: number = 250;
  @Input() public debounced: (text?: string) => Observable<any> = () => EMPTY;

  public constructor(
    private input: MuiInputComponent
  ) { }

  public ngOnInit(): void {
    const search$ = new Subject<string>();
    search$.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
      switchMap(e => this.debounced(e).pipe(catchError(() => EMPTY))),
    ).subscribe();
    this.input.mChange.subscribe(e => search$.next(e));
  }
}
