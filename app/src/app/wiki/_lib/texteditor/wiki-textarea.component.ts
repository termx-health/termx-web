import {Component, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';


@Component({
  selector: 'tw-wiki-textarea',
  template: `
    <div class="tw-textarea" contenteditable (input)="fireOnChange($event.target)" [innerHtml]="value"></div>
  `,
  styles: [`
    .tw-textarea {
      white-space: pre-wrap;

      display: inline-block;
      min-height: 80px;
      width: 100%;
      padding: 1rem;

      border: 1px solid #d2d2d2;
      border-radius: 5px;

      &:before {
        content: attr(placeholder);
        display: block;
      }

      &:focus {
        outline: none;

        &:before {
          display: none;
        }
      }
    }
  `],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WikiTextareaComponent), multi: true}]
})
export class WikiTextareaComponent implements ControlValueAccessor {
  public value?: string;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public writeValue(val: string): void {
    this.value = val;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public fireOnChange(target: any): void {
    this.onChange(target.innerText);
  }
}
