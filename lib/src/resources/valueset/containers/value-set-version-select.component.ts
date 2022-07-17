import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {ValueSetVersion} from '../model/value-set-version';
import {ValueSetLibService} from '../services/value-set-lib.service';
import {takeUntil} from 'rxjs';
import {ValueSetVersionLibService} from '../services/value-set-version-lib.service';


@Component({
  selector: 'twl-value-set-version-select',
  templateUrl: './value-set-version-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ValueSetVersionSelectComponent), multi: true}, DestroyService]
})
export class ValueSetVersionSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public valueSetId!: string;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;

  public data: {[version: string]: ValueSetVersion} = {};
  public value?: number;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public constructor(
    private valueSetService: ValueSetLibService,
    private valueSetVersionService: ValueSetVersionLibService,
    private destroy$: DestroyService
  ) {}

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
      this.data = group(versions.data, v => v.version!);
    }).add(() => this.loading['select'] = false);
  }

  private loadVersion(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.valueSetVersionService.load(id).pipe(takeUntil(this.destroy$)).subscribe(v => {
        this.data[v.version!] = v;
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: ValueSetVersion | number): void {
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


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
