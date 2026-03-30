import { Component, forwardRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DestroyService, group, isDefined, KeysPipe } from '@termx-health/core-util';
import {takeUntil} from 'rxjs';
import {ValueSetVersionSearchParams} from 'term-web/resources/_lib';
import {ValueSetVersion} from 'term-web/resources/_lib/value-set/model/value-set-version';
import {ValueSetLibService} from 'term-web/resources/_lib/value-set/services/value-set-lib.service';
import { MuiSelectModule, MuiAbbreviateModule } from '@termx-health/ui';

import { MarinaUtilModule } from '@termx-health/util';


@Component({
    selector: 'tw-value-set-version-select',
    templateUrl: './value-set-version-select.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ValueSetVersionSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, MuiAbbreviateModule, KeysPipe, MarinaUtilModule]
})
export class ValueSetVersionSelectComponent implements OnChanges, ControlValueAccessor {
  private valueSetService = inject(ValueSetLibService);
  private destroy$ = inject(DestroyService);

  @Input() public valueSetId!: string;
  @Input() public valueType: 'id' | 'version' | 'full' = 'full';

  public data: {[version: string]: ValueSetVersion} = {};
  public value?: number | string;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSetId"]) {
      this.loadVersions();
    }
  }

  private loadVersions(): void {
    if (!this.valueSetId) {
      this.value = undefined;
      this.data = {};
      return;
    }

    this.loading['select'] = true;
    this.valueSetService.searchVersions(this.valueSetId, {limit: -1}).pipe(takeUntil(this.destroy$)).subscribe(versions => {
      this.data = group(versions.data, v => this.valueType === 'id' ? v.id : v.version);
    }).add(() => this.loading['select'] = false);
  }

  private loadVersion(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }
    this.loading['load'] = true;
    const params:ValueSetVersionSearchParams = {limit: 1};
    params.ids = typeof val === 'number' ? String(val) : undefined;
    params.version = typeof val === 'string' ? val : undefined;
    this.valueSetService.searchVersions(this.valueSetId, params).pipe(takeUntil(this.destroy$)).subscribe(r => {
      const data = group(r.data, v => this.valueType === 'id' ? v.id : v.version);
      this.data = {...(this.data || {}), ...data};
    }).add(() => this.loading['load'] = false);
  }


  public writeValue(obj: ValueSetVersion | string | number): void {
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
