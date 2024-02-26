import {Component, forwardRef, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MuiQuillComponent} from '@kodality-web/marina-quill';
import {WikiAbstractEditor} from '../abstract-text-editor';


@Component({
  selector: 'tw-wiki-quill-editor',
  template: `
    <m-quill
        #quill
        [(ngModel)]="value"
        (ngModelChange)="fireOnChange()"
        [disabled]="disabled"
    />
  `,
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WikiQuillEditorComponent), multi: true}]
})
export class WikiQuillEditorComponent implements ControlValueAccessor, WikiAbstractEditor {
  protected disabled: boolean;

  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x: any): void => x;

  @ViewChild('quill')
  private quill: MuiQuillComponent;

  protected fireOnChange(): void {
    this.onChange(this.value);
  }


  /* CVA */

  public writeValue(val: string): void {
    this.value = val;
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


  /* Impl */

  private _lastCursorPosition: number;

  public get cursorPosition(): number {
    return this._lastCursorPosition = this.quill.getSelection()?.index ?? this._lastCursorPosition;
  };

  public setCursorPosition(pos: number): void {
    this.quill.setSelection(pos);
  };

  public insertAtCursorPosition(pos: number, content: string): void {
    this.quill.insertText(pos, content);
  };

  public replaceRangeWith(from: number, to: number, content: string): void {
    this.quill.deleteText(from, to - from);
    this.quill.insertText(from, content);
  }
}
