import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, LoadingManager} from '@kodality-web/core-util';
import {PageLibService} from '../services/page-lib.service';
import {PageTreeItem} from '../models/page-tree.item';


@Component({
  selector: 'tw-page-content-tree-select',
  template: `
    <m-select icon="search"
        [placeholder]="placeholder"
        [multiple]="multiple | toBoolean"
        [(ngModel)]="value"
        (ngModelChange)="fireOnChange()"
        [loading]="loader.isLoading">
      <m-option *ngFor="let o of data | apply:flat" [mValue]="o.id" [mLabel]="o.name" [mLabelTemplate]="lbl">
        <ng-template #lbl>
          <label style="padding-left: 0{{o.level * 10}}px">{{o.name}}</label>
        </ng-template>
      </m-option>
    </m-select>
  `,
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageContentTreeSelectComponent), multi: true}]
})
export class PageContentTreeSelectComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() public spaceId: number;

  protected data: PageTreeItem[];
  protected value?: number | number[];
  protected loader = new LoadingManager();

  private onChange = (x: any) => x;
  private onTouched = (x: any) => x;

  public constructor(
    private pageService: PageLibService
  ) {}


  public ngOnInit(): void {
    this.loader.wrap('load', this.pageService.loadTree(this.spaceId)).subscribe(r => this.data = r);
  }

  /* CVA */

  public writeValue(obj: number | number[]): void {
    this.value = obj;
  }

  public fireOnChange(): void {
    this.onChange(this.value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }


  /* Utils */

  protected flat = (data: PageTreeItem[], level: number = 0): {id: number, name: string, level: number}[] => {
    let result = [];
    if (data) {
      data.forEach(d => {
        Object.values(d.contents).forEach(c => result.push({
          id: c.id,
          name: c.name,
          level: level
        }));
        if (d.children) {
          result = [...result, ...this.flat(d.children, level + 1)];
        }
      });
    }
    return result;
  };
}
