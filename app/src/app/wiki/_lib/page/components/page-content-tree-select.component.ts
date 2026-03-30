import { Component, forwardRef, Input, OnInit, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, LoadingManager, ApplyPipe, ToBooleanPipe } from '@termx-health/core-util';
import {PageTreeItem} from 'term-web/wiki/_lib/page/models/page-tree.item';
import {PageLibService} from 'term-web/wiki/_lib/page/services/page-lib.service';
import { MuiSelectModule } from '@termx-health/ui';



@Component({
    selector: 'tw-page-content-tree-select',
    template: `
    <m-select icon="search"
      [placeholder]="placeholder"
      [multiple]="multiple | toBoolean"
      [(ngModel)]="value"
      (ngModelChange)="fireOnChange()"
      [loading]="loader.isLoading">
      @for (o of data | apply:flat; track o) {
        <m-option [mValue]="o.id" [mLabel]="o.name" [mLabelTemplate]="lbl">
          <ng-template #lbl>
            <label style="padding-left: 0{{o.level * 10}}px">{{o.name}}</label>
          </ng-template>
        </m-option>
      }
    </m-select>
    `,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageContentTreeSelectComponent), multi: true }],
    imports: [MuiSelectModule, FormsModule, ApplyPipe, ToBooleanPipe]
})
export class PageContentTreeSelectComponent implements OnInit, ControlValueAccessor {
  private pageService = inject(PageLibService);

  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() public spaceId: number;

  protected data: PageTreeItem[];
  protected value?: number | number[];
  protected loader = new LoadingManager();

  private onChange = (x: any): any => x;
  private onTouched = (x: any): any => x;


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
