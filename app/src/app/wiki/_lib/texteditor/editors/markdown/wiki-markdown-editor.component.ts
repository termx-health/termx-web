import {AfterViewInit, Component, ElementRef, forwardRef, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {basicSetup, EditorView} from 'codemirror';
import {markdown} from '@codemirror/lang-markdown';
import {EditorState} from '@codemirror/state';
import {keymap} from '@codemirror/view';


import {indentWithTab} from "@codemirror/commands";
import {WikiAbstractEditor} from '../abstract-text-editor';


@Component({
  selector: 'tw-wiki-markdown-editor',
  template: `
    <div #el [hidden]="!_styled" [class.cm-wrapper]="_styled"></div>
  `,
  styles: [`
    ::ng-deep {
      .cm-wrapper, .cm-editor {
        height: 100%;
      }
    }
  `],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WikiMarkdownEditorComponent), multi: true}]
})
export class WikiMarkdownEditorComponent implements AfterViewInit, ControlValueAccessor, WikiAbstractEditor {
  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x: any): void => x;

  @ViewChild('el') protected el: ElementRef<HTMLElement>;
  private view: EditorView;
  protected _styled: boolean;

  /* CodeMirror */

  public ngAfterViewInit(): void {
    const extensions = [
      basicSetup,
      keymap.of([
        indentWithTab
      ]),

      markdown(),

      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          this.onDocumentChange(update.state.doc.toString());
        }
      })
    ];

    const state = EditorState.create({
      doc: this.value,
      extensions: extensions
    });

    this.view = new EditorView({
      parent: this.el.nativeElement,
      state: state
    });

    // for some reason, when height is set before CM is initialized, it scrolls down to the bottom
    setTimeout(() => this._styled = true);
  }

  private onDocumentChange(doc: string): void {
    this.onChange(doc);
  }

  private updateDocument(doc: string): void {
    this.view?.dispatch({
      changes: {from: 0, to: this.view?.state.doc.length, insert: doc}
    });
  }


  /* CVA */

  public writeValue(val: string): void {
    this.value = val;
    this.updateDocument(val);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    // fixme: I have no freaking idea, how to set CM to readonly mode EASILY
  }


  /* Impl */

  public get cursorPosition(): number {
    return this.view.state.selection.main.from;
  };

  public setCursorPosition(pos: number): void {
    this.view.focus();
    this.view.dispatch({
      selection: {
        anchor: pos,
        head: pos,
      }
    });
  };

  public insertAtCursorPosition(pos: number, content: string): void {
    this.view.focus();
    this.view.dispatch({
      changes: {
        from: pos,
        insert: content
      }
    });
  };

  public replaceRangeWith(from: number, to: number, content: string): void {
    this.view.focus();
    this.view.dispatch({
      changes: {
        from: from,
        to: to,
        insert: content
      }
    });
  }
}
