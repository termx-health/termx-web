import {AfterViewInit, Component, ElementRef, forwardRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {basicSetup, EditorView} from 'codemirror';
import {markdown} from '@codemirror/lang-markdown';
import {Compartment, EditorState} from '@codemirror/state';
import {keymap} from '@codemirror/view';


import {indentWithTab} from "@codemirror/commands";
import {WikiAbstractEditor} from '../abstract-text-editor';
import {BooleanInput} from '@kodality-web/core-util';


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
export class WikiMarkdownEditorComponent implements OnChanges, AfterViewInit, ControlValueAccessor, WikiAbstractEditor {
  @Input() @BooleanInput() public lineWrapping: boolean | string;

  protected value?: string;
  protected onChange = (x: any): void => x;
  protected onTouched = (x: any): void => x;

  @ViewChild('el') protected el: ElementRef<HTMLElement>;
  private view: EditorView;
  protected _styled: boolean;


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['lineWrapping']) {
      this.reconfigureExtensions()
    }
  }

  /* CodeMirror */

  private _extensions = new Compartment();
  private _baseExtensions = [
    basicSetup,
    keymap.of([indentWithTab]),

    markdown(),

    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        this.onDocumentChange(update.state.doc.toString());
      }
    }),
  ];


  public ngAfterViewInit(): void {
    const state = EditorState.create({
      doc: this.value,
      extensions: this._extensions.of(this._baseExtensions)
    });

    this.view = new EditorView({
      parent: this.el.nativeElement,
      state: state
    });

    this.reconfigureExtensions();

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

  private reconfigureExtensions(): void {
    const state = [...this._baseExtensions];
    if (this.lineWrapping) {
      state.push(EditorView.lineWrapping);
    }

    this.view?.dispatch({
      effects: this._extensions.reconfigure(state)
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
