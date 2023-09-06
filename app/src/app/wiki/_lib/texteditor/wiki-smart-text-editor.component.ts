import {Component, ElementRef, forwardRef, Input, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, isDefined, isNil} from '@kodality-web/core-util';
import {getCursorPosition, setCursorPosition} from './utils/cursor.utils';
import {launchDrawioEditor} from './editors/drawio.editor';
import {contentFromSelection, indexOfDifference} from './utils/selection.utils';
import {BehaviorSubject, concat, debounceTime, take} from 'rxjs';

@Component({
  selector: 'tw-smart-text-editor',
  templateUrl: 'wiki-smart-text-editor.component.html',
  styles: [`
    :host {
      position: relative;
    }

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
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WikiSmartTextEditorComponent), multi: true}
  ]
})
export class WikiSmartTextEditorComponent implements ControlValueAccessor {
  @Input() public lang?: string;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() @BooleanInput() public showPreview: boolean | string;
  @Input() @BooleanInput() public viewMode: boolean | string;

  @ViewChild('ref') private textArea: ElementRef<HTMLElement>;

  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x?: any): void => x;

  private value$ = new BehaviorSubject<string>(undefined);
  // debounced value, copied on change
  protected valueView$ = concat(
    this.value$.pipe(take(1)),
    this.value$.pipe(debounceTime(350))
  );


  /* Cursor*/

  private _lastCursorPosition;

  protected updateCursorPosition(): void {
    const pos = getCursorPosition(this.textarea);
    if (pos) {
      this._lastCursorPosition = pos;
    }
  }

  public insertAtLastCursorPosition(val: string): void {
    if (isNil(this._lastCursorPosition)) {
      return;
    }

    const start = this.value.slice(0, this._lastCursorPosition);
    const end = this.value.slice(this._lastCursorPosition);

    const text = `${start}${val}${end}`;
    this.setValue(text, this._lastCursorPosition + val.length);
  }


  /* Editors */

  public launchEditor(name: string): void {
    if (isNil(this._lastCursorPosition)) {
      return;
    }

    switch (name) {
      case 'drawio':
        const {selection, startPos} = contentFromSelection(this.value, this._lastCursorPosition, '```drawio', '```');
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
              this.insertAtLastCursorPosition(`\n\`\`\`drawio\n${btoa(diagramSvg)}\n\`\`\`\n`)
            },
          },
        });
    }
  }


  /* CVA */

  public writeValue(val: string): void {
    this.value = val;
    this.value$.next(val);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }


  /* Value change */

  protected fireOnChange(val: string): void {
    this.onChange(val);
    this.value$.next(val);
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
