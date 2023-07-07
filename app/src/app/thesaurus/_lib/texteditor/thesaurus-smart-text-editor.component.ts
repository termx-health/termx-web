import {Component, ElementRef, forwardRef, Input, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, isDefined, isNil} from '@kodality-web/core-util';

@Component({
  selector: 'tw-smart-text-editor',
  templateUrl: './thesaurus-smart-text-editor.component.html',
  styles: [`
    ::ng-deep .editor-wrapper {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      height: 100%;

      & > * {
        height: 100%;
        overflow: auto;
      }

      .editor__editor {
        flex: 50%;

        /* Markdown */

        .tw-textarea {
          font-size: 0.9rem;
          border: unset;
          border-radius: unset;
        }

        /* Quill*/

        .ql-toolbar {
          border-inline: 0;
          border-top: 0;
        }

        .ql-container {
          border-inline: 0;
          border-bottom: 0;
        }
      }

      .editor__preview {
        flex: 50%;
        padding: 1rem;
        border-left: 1px solid var(--color-borders);
      }
    }
  `],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ThesaurusSmartTextEditorComponent), multi: true}]
})
export class ThesaurusSmartTextEditorComponent implements ControlValueAccessor {
  @Input() @BooleanInput() public viewMode: boolean | string;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() @BooleanInput() public showPreview: boolean | string;
  @Input() public lang?: string;

  @ViewChild('ref') private textArea: ElementRef<HTMLElement>;

  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x?: any): void => x;


  public insertAtCursor(result: string, range: Range): void {
    if (isNil(result)) {
      result = "";
    }

    const selection = window.getSelection();
    const textarea = this.textArea.nativeElement;
    if (!selection || !range) {
      return;
    }


    const currentText = textarea.innerText;
    range.deleteContents();
    range.insertNode(document.createTextNode(result));

    selection.removeAllRanges();
    selection.addRange(range);
    let newText = textarea?.innerText;

    const i = this.indexOfDifference(currentText, newText);
    if (isDefined(i) && newText && newText.charAt(i - 1) === '/') {
      newText = newText.slice(0, i - 1) + newText.slice(i);
    }

    this.value = newText;
    this.fireOnChange(newText ?? "");
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

  public fireOnChange(val: string): void {
    this.onChange(val);
  }


  /* Utils */

  private indexOfDifference(str1?: string, str2?: string): number | undefined {
    if (str1 == str2 || !isDefined(str1) || !isDefined(str2)) {
      return;
    }
    for (var i = 0; i < str1.length && i < str2.length; ++i) {
      if (str1.charAt(i) != str2.charAt(i)) {
        break;
      }
    }
    if (i < str2.length || i < str1.length) {
      return i;
    }
  }

}
