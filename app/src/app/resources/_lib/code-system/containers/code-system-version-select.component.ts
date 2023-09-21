import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {CodeSystemLibService, CodeSystemVersion} from '../../code-system';
import {CodeSystemVersionLibService} from '../services/code-system-version-lib.service';
import {takeUntil} from 'rxjs';


@Component({
  selector: 'tw-code-system-version-select',
  templateUrl: './code-system-version-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemVersionSelectComponent), multi: true}, DestroyService]
})
export class CodeSystemVersionSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public codeSystemId?: string;
  @Input() @BooleanInput() public valuePrimitive: string | boolean;
  @Input() @BooleanInput() public disabled: string | boolean;

  public data: {[version: string]: CodeSystemVersion} = {};
  public value?: number;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private codeSystemVersionService: CodeSystemVersionLibService,
    private destroy$: DestroyService
  ) {}

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
      this.data = group(versions.data, v => v.id!);
    }).add(() => this.loading['select'] = false);
  }

  private loadVersion(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.codeSystemVersionService.load(id).pipe(takeUntil(this.destroy$)).subscribe(v => {
        this.data[v.version!] = v;
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: CodeSystemVersion | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
    this.loadVersion(this.value);
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

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
