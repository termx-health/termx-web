import { Component, forwardRef, Input, OnInit, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, group, KeysPipe } from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select';
import {catchError, finalize, map, of, takeUntil} from 'rxjs';
import {AssociationType, AssociationTypeLibService, AssociationTypeSearchParams} from 'term-web/resources/_lib/association';
import { MuiSelectModule } from '@kodality-web/marina-ui';


@Component({
    selector: 'tw-association-type-search',
    templateUrl: './association-type-search.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AssociationTypeSearchComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, KeysPipe]
})
export class AssociationTypeSearchComponent implements OnInit {
  private associationTypeService = inject(AssociationTypeLibService);
  private destroy$ = inject(DestroyService);

  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public associationKind: 'concept-map-equivalence' | 'codesystem-hierarchy-meaning';
  @Input() public placeholder: string = 'marina.ui.inputs.select.placeholder';
  @Input() public filter?: (resource: AssociationType) => boolean;

  public data: {[code: string]: AssociationType} = {};
  public value?: string;
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): any => x;
  public onTouched = (x: any): any => x;

  public ngOnInit(): void {
    this.loadTypes();
  }

  private loadTypes(): void {
    const q = new AssociationTypeSearchParams();
    q.limit = 10_000;
    q.associationKinds = this.associationKind;

    this.loading['search'] = true;
    this.associationTypeService.search(q).pipe(
      takeUntil(this.destroy$),
      map(tr => group(tr.data, t => t.code!)),
      catchError(() => of(this.data!)),
      finalize(() => this.loading['search'] = false)
    ).subscribe(data => this.data = data);
  }

  public writeValue(obj: AssociationType | string): void {
    this.value = typeof obj === 'object' ? obj?.code : obj;
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

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
