import {Component, ElementRef, forwardRef, Input, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, isDefined, isNil} from '@kodality-web/core-util';
import {getCursorPosition, setCursorPosition} from './utils/cursor.utils';
import {launchDrawioEditor} from './editors/drawio.editor';
import {contentFromSelection, indexOfDifference} from './utils/selection.utils';

@Component({
  selector: 'tw-smart-text-editor',
  templateUrl: 'wiki-smart-text-editor.component.html',
  styles: [`
    ::ng-deep .drawio-editor {
      z-index: 1000;
      position: absolute;
      inset: 0;
      border: 0;
      height: 100%;
      width: 100%;
      visibility: hidden;
    }

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
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WikiSmartTextEditorComponent), multi: true}]
})
export class WikiSmartTextEditorComponent implements ControlValueAccessor {
  @Input() @BooleanInput() public viewMode: boolean | string;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() @BooleanInput() public showPreview: boolean | string;
  @Input() public lang?: string;

  @ViewChild('ref') private textArea: ElementRef<HTMLElement>;

  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x?: any): void => x;


  /* Cursor*/

  private _lastCursor;

  protected updateCursorPosition(): void {
    const pos = getCursorPosition(this.textarea);
    if (pos) {
      this._lastCursor = pos;
    }
  }

  protected restoreCursor(): void {
    setCursorPosition(this._lastCursor, this.textarea);
  }

  /* Extensions */


  public launchEditor(name: string): void {
    if (isNil(this._lastCursor)) {
      return;
    }

    switch (name) {
      case 'drawio':
        const {selection, startPos} = contentFromSelection(this.value, this._lastCursor, '```drawio', '```');
        const base64 = selection?.match(/```drawio\n?(.+)\n?```/)?.[1];

        launchDrawioEditor({
          editorFacade: {
            getDiagram: () => ({
              svg: base64 ? atob(base64) : undefined,
              markdown: selection
            }),
            updateDiagram: ({diagramMarkdown, diagramSvg}) => {
              const text = this.value.replace(diagramMarkdown, `\`\`\`drawio\n${btoa(diagramSvg)}\n\`\`\``);
              this.setValue(text, startPos);
            },
            insertDiagram: ({diagramSvg}) => {
              const start = this.value.slice(0, this._lastCursor);
              const end = this.value.slice(this._lastCursor);

              const text = `${start}\n\`\`\`drawio\n${btoa(diagramSvg)}\n\`\`\`\n${end}`;
              this.setValue(text, startPos);
            },
          },
        });
    }
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

  private setValue(text: string, pos?: number): void {
    // update ngModel value
    this.value = text;
    this.fireOnChange(text ?? "");

    // restore/set cursor position
    if (isDefined(pos)) {
      setTimeout(() => setCursorPosition(pos, this.textarea));
    }
  }


  /* Cursor Magic */

  protected insertAtRange(text: string, range: Range, offset = 0): void {
    if (isNil(text)) {
      text = "";
    }

    let cursorPosition = getCursorPosition(this.textarea);
    if (!range) {
      return;
    }

    // insert text into the range
    const currentText = this.textarea.innerText;
    range.deleteContents();
    range.insertNode(document.createTextNode(text));

    // get new content
    let newText = this.textarea.innerText;

    // remove "/" from the content
    const diffIdx = indexOfDifference(currentText, newText);
    if (isDefined(diffIdx) && isDefined(newText) && newText.charAt(diffIdx - 1) === '/') {
      cursorPosition = diffIdx - 1;
      newText = newText.slice(0, diffIdx - 1) + newText.slice(diffIdx);
    }

    this.setValue(newText, cursorPosition + offset);
  }

  private get textarea(): HTMLElement {
    return this.textArea.nativeElement;
  }
}
