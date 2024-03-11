import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined, LoadingManager} from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';
import {catchError, map, Observable, of, takeUntil} from 'rxjs';
import {Space} from '../model/space';
import {SpaceSearchParams} from '../model/space-search-params';
import {SpaceLibService} from '../services/space-lib-service';

@Component({
  selector: 'tw-space-select',
  templateUrl: './space-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SpaceSelectComponent), multi: true}, DestroyService]
})
export class SpaceSelectComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: Space) => boolean;

  protected data: {[id: number]: Space} = {};
  protected value?: number;
  protected loader = new LoadingManager();

  private onChange = (x: any) => x;
  private onTouched = (x: any) => x;

  public constructor(
    private spaceService: SpaceLibService,
    private destroy$: DestroyService
  ) {}


  public ngOnInit(): void {
    this.loadSpaces().subscribe(data => this.data = data);
  }

  private loadSpaces(): Observable<{[id: number]: Space}> {
    const q = new SpaceSearchParams();
    q.limit = 10_000;

    const req$ = this.spaceService.search(q).pipe(
      takeUntil(this.destroy$),
      map(spaces => group(spaces.data, s => s.id)),
      catchError(() => of(this.data!)),
    );
    return this.loader.wrap('search', req$);
  }

  private loadSpace(id?: number): void {
    if (isDefined(id)) {
      this.loader.wrap('load', this.spaceService.load(id)).pipe(takeUntil(this.destroy$)).subscribe(s => {
        this.data = {...this.data, [s.id]: s};
      });
    }
  }


  /* CVA */

  public writeValue(obj: Space | number): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadSpace(this.value);
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
}
