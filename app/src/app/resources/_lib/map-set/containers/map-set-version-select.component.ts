import { Component, forwardRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DestroyService, group, isDefined, KeysPipe } from '@termx-health/core-util';
import {takeUntil} from 'rxjs';
import {MapSetVersion} from 'term-web/resources/_lib/map-set/model/map-set-version';
import {MapSetVersionSearchParams} from 'term-web/resources/_lib/map-set/model/map-set-version-search-params';
import {MapSetLibService} from 'term-web/resources/_lib/map-set/services/map-set-lib.service';
import { MuiSelectModule } from '@termx-health/ui';

import { MarinaUtilModule } from '@termx-health/util';


@Component({
    selector: 'tw-map-set-version-select',
    templateUrl: './map-set-version-select.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MapSetVersionSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, KeysPipe, MarinaUtilModule]
})
export class MapSetVersionSelectComponent implements OnChanges, ControlValueAccessor {
  private mapSetService = inject(MapSetLibService);
  private destroy$ = inject(DestroyService);

  @Input() public mapSetId!: string;
  @Input() public valueType: 'id' | 'version' | 'full' = 'full';

  public data: {[version: string]: MapSetVersion} = {};
  public value?: number | string;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["mapSetId"]) {
      this.loadVersions();
    }
  }

  private loadVersions(): void {
    if (!this.mapSetService) {
      this.value = undefined;
      this.data = {};
      return;
    }

    this.loading['select'] = true;
    this.mapSetService.searchVersions(this.mapSetId, {limit: -1}).pipe(takeUntil(this.destroy$)).subscribe(versions => {
      this.data = group(versions.data, v => this.valueType === 'id' ? v.id : v.version);
    }).add(() => this.loading['select'] = false);
  }

  private loadVersion(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }
    this.loading['load'] = true;
    const params:MapSetVersionSearchParams = {limit: 1};
    params.ids = typeof val === 'number' ? String(val) : undefined;
    params.version = typeof val === 'string' ? val : undefined;
    this.mapSetService.searchVersions(this.mapSetId, params).pipe(takeUntil(this.destroy$)).subscribe(r => {
      const data = group(r.data, v => this.valueType === 'id' ? v.id : v.version);
      this.data = {...(this.data || {}), ...data};
    }).add(() => this.loading['load'] = false);
  }


  public writeValue(obj: MapSetVersion | string | number): void {
    this.value = (typeof obj === 'object' ? obj?.version : obj);
    this.loadVersion(this.value);
  }

  public fireOnChange(): void {
    if (['id', 'version'].includes(this.valueType)) {
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
