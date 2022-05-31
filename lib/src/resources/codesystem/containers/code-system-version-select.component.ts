import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, group, isDefined} from '@kodality-web/core-util';
import {CodeSystemLibService} from '../services/code-system-lib.service';
import {CodeSystemVersion} from '../model/code-system-version';
import {CodeSystemVersionLibService} from '../services/code-system-version-lib.service';


@Component({
  selector: 'twl-code-system-version-select',
  templateUrl: './code-system-version-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemVersionSelectComponent), multi: true}]
})
export class CodeSystemVersionSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public codeSystemId?: string;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;

  public data: {[version: string]: CodeSystemVersion} = {};
  public value?: number;
  public loading: boolean = false;

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private codeSystemVersionService: CodeSystemVersionLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]) {
      this.loadVersions();
    }
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[this.value!]);
    }
  }

  public loadVersions(): void {
    if (!this.codeSystemId) {
      this.value = undefined;
      this.data = {};
      return;
    }
    this.loading = true;
    this.codeSystemService.loadVersions(this.codeSystemId)
      .subscribe(versions => this.data = group(versions, v => v.id!))
      .add(() => this.loading = false);
  }

  public loadVersion(id?: number): void {
    if (isDefined(id)) {
      this.loading = true;
      this.codeSystemVersionService.load(id).subscribe(v => this.data[v.version!] = v).add(() => this.loading = false);
    }
  }

  public writeValue(obj: CodeSystemVersion | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
    this.loadVersion(this.value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
