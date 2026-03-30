import { Component, forwardRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined, KeysPipe } from '@termx-health/core-util';
import {takeUntil} from 'rxjs';
import {CodeSystemLibService, CodeSystemVersion, CodeSystemVersionSearchParams} from 'term-web/resources/_lib/code-system';
import { MuiSelectModule, MuiAbbreviateModule } from '@termx-health/ui';

import { MarinaUtilModule } from '@termx-health/util';


@Component({
    selector: 'tw-code-system-version-select',
    templateUrl: './code-system-version-select.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemVersionSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, MuiAbbreviateModule, KeysPipe, MarinaUtilModule]
})

export class CodeSystemVersionSelectComponent implements OnChanges, ControlValueAccessor {
  private codeSystemService = inject(CodeSystemLibService);
  private destroy$ = inject(DestroyService);

  @Input() public codeSystemId?: string;
  @Input() public valueType: 'id' | 'version' | 'full' = 'full';
  @Input() @BooleanInput() public disabled: string | boolean;
  @Input() @BooleanInput() public autoSelect: string | boolean = true;
  @Input() @BooleanInput() public autoSelectOnlyWhenSingle: string | boolean = false;

  public data: {[version: string]: CodeSystemVersion} = {};
  public value?: number | string;
  public effectiveAutoSelect: boolean = true;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]) {
      this.loadSelectData();
    }
  }

  private loadSelectData(): void {
    if (!this.codeSystemId) {
      this.data = {};
      this.value = undefined;
      return;
    }

    this.loading['select'] = true;
    this.codeSystemService.searchVersions(this.codeSystemId, {limit: -1}).pipe(takeUntil(this.destroy$)).subscribe(versions => {
      this.data = group(versions.data, v => this.valueType === 'id' ? v.id : v.version);
      this.effectiveAutoSelect = this.autoSelectOnlyWhenSingle ? false : !!this.autoSelect;
    }).add(() => this.loading['select'] = false);
  }

  private loadVersion(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }
    this.loading['load'] = true;
    const params:CodeSystemVersionSearchParams = {limit: 1};
    params.ids = typeof val === 'number' ? String(val) : undefined;
    params.version = typeof val === 'string' ? val : undefined;
    this.codeSystemService.searchVersions(this.codeSystemId, params).pipe(takeUntil(this.destroy$)).subscribe(r => {
      const data = group(r.data, v => this.valueType === 'id' ? v.id : v.version);
      this.data = {...(this.data || {}), ...data};
    }).add(() => this.loading['load'] = false);
  }


  public writeValue(obj: CodeSystemVersion | string | number): void {
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

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
