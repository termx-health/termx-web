import { Component, forwardRef, Input, OnInit, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined, LoadingManager, KeysPipe } from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select';
import {catchError, map, Observable, of, takeUntil} from 'rxjs';
import {Space} from 'term-web/sys/_lib/space/model/space';
import {SpaceSearchParams} from 'term-web/sys/_lib/space/model/space-search-params';
import {SpaceLibService} from 'term-web/sys/_lib/space/services/space-lib-service';
import { MuiSelectModule } from '@kodality-web/marina-ui';

import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    selector: 'tw-space-select',
    templateUrl: './space-select.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SpaceSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, MarinaUtilModule, KeysPipe]
})
export class SpaceSelectComponent implements OnInit {
  private spaceService = inject(SpaceLibService);
  private destroy$ = inject(DestroyService);

  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: Space) => boolean;

  protected data: {[id: number]: Space} = {};
  protected value?: number;
  protected loader = new LoadingManager();

  private onChange = (x: any): any => x;
  private onTouched = (x: any): any => x;


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
