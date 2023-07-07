import {Component, forwardRef, Input} from '@angular/core';
import {BooleanInput, DestroyService} from '@kodality-web/core-util';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'tw-task-type',
  templateUrl: './task-type.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TaskTypeComponent), multi: true}, DestroyService]
})
export class TaskTypeComponent implements ControlValueAccessor {
  @Input() @BooleanInput() public readonly: string | boolean = false;

  protected selectOpened: boolean = false;
  protected readonly taskTypeColorMap = {
    'task': 'darkblue',
    'phase': 'royalblue',
    'epic': 'orange',
    'feature': 'steelblue',
    'milestone': 'green',
    'bug': 'red'
  };

  public value?: string;

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor() {}

  public writeValue(obj: string): void {
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

  protected taskTypeColor = (type: string): string => {
    return this.taskTypeColorMap[type] || 'grey';
  };

  protected typeSelected(type: string): void {
    this.value = type;
    this.selectOpened = false;
    this.fireOnChange();
  }
}
