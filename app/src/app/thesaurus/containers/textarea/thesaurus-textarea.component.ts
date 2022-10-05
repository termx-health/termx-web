import {Component, forwardRef} from '@angular/core';
import {DestroyService} from '@kodality-web/core-util';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'twa-thesaurus-textarea',
  template: `
    <div id="textarea" class="tw-textarea" contenteditable (input)="fireOnChange($event.target)">{{value}}</div>
  `,
  styles: [`
    .tw-textarea {
      padding: 1rem;
      min-height: 80px;
      border: 1px solid #d2d2d2;
      border-radius: 5px;
      white-space: pre;
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
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ThesaurusTextareaComponent), multi: true}, DestroyService]
})
export class ThesaurusTextareaComponent implements ControlValueAccessor {
  public value?: string;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public writeValue(text: string): void {
    this.value = text;
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
