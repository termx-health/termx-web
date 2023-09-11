import {Component, forwardRef, Input, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, isDefined, isNil} from '@kodality-web/core-util';
import {launchDrawioEditor} from './editor-external/drawio.editor';
import {contentFromSelection} from './utils/selection.utils';
import {BehaviorSubject, concat, debounceTime, take} from 'rxjs';
import {WikiAbstractEditor} from './editors/abstract-text-editor';


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
  @Input() @BooleanInput() public lineNumbers: boolean | string;

  @ViewChild('editor')
  private _editor: WikiAbstractEditor;

  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x?: any): void => x;

  private value$ = new BehaviorSubject<string>(undefined);
  // debounced value, copied on change
  protected valueView$ = concat(
    this.value$.pipe(take(1)),
    this.value$.pipe(debounceTime(350))
  );


  /* Cursor */

  public insertAtLastCursorPosition(val: string): void {
    const lastCursorPosition = this._editor.cursorPosition;
    if (isDefined(lastCursorPosition)) {
      this._editor.insertAtCursorPosition(lastCursorPosition, val);
      this._editor.setCursorPosition(lastCursorPosition + val.length);
    }
  }

  protected insertAtCursor(text: string, offset = 0): void {
    const cp = this._editor.cursorPosition - 1; // because of the '/' symbol
    const nextCp = cp + offset;

    this._editor.replaceRangeWith(cp, cp + 1, text ?? "");
    this._editor.setCursorPosition(nextCp);
  }


  /* Editors */

  public launchEditor(name: string): void {
    if (isNil(this._editor.cursorPosition)) {
      return;
    }

    switch (name) {
      case 'drawio':
        const {selection, startPos, endPos} = contentFromSelection(this.value, this._editor.cursorPosition, '```drawio', '```');
        const base64 = selection?.match(/```drawio\n?(.+)\n?```/)?.[1];

        launchDrawioEditor({
          editorFacade: {
            getDiagram: () => ({
              svg: base64 ? atob(base64) : undefined,
              markdown: selection
            }),
            updateDiagram: ({diagramSvg}) => {
              this._editor.replaceRangeWith(startPos, endPos + 3, `\`\`\`drawio\n${btoa(diagramSvg)}\n\`\`\``);
            },
            insertDiagram: ({diagramSvg}) => {
              this.insertAtLastCursorPosition(`\n\`\`\`drawio\n${btoa(diagramSvg)}\n\`\`\`\n`);
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
}
