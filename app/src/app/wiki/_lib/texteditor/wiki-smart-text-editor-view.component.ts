import {Component, ElementRef, EnvironmentInjector, EventEmitter, Input, Output} from '@angular/core';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {structureDefinitionCodePlugin} from './markdown-plugins/structure-definition-code.plugin';
import {structureDefinitionFshPlugin} from './markdown-plugins/structure-definition-fsh.plugin';
import {createCustomElement} from '@angular/elements';
import {drawioPlugin} from './markdown-plugins/drawio.plugin';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib';
import {localImage} from './markdown-plugins/image.plugin';
import {localLink} from 'term-web/wiki/_lib/texteditor/markdown-plugins/link.plugin';
import {debounceTime, filter, fromEvent, map} from 'rxjs';
import {WikiCommentPopoverComponent} from 'term-web/wiki/_lib/texteditor/comments/wiki-comment-popover.component';
import {sourceLinePlugin} from 'term-web/wiki/_lib/texteditor/markdown-plugins/source-line.plugin';
import {WikiComment} from 'term-web/wiki/_lib/texteditor/comments/wiki-comment';

@Component({
  selector: 'tw-smart-text-editor-view',
  templateUrl: 'wiki-smart-text-editor-view.component.html',
  styles: [`
    ::ng-deep tw-smart-text-editor-view .ql-editor {
      padding: 0;
    }
  `]
})
export class WikiSmartTextEditorViewComponent {
  @Input() public value?: string;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public prerender?: boolean; // markdown option

  @Output() public commentCreated = new EventEmitter<WikiComment>();

  protected plugins = {
    list: [
      sourceLinePlugin,
      localLink,
      localImage,
      structureDefinitionCodePlugin,
      structureDefinitionFshPlugin,
      drawioPlugin
    ],
    options: {
      spaceId: this.preferences.spaceId
    }
  };


  public constructor(
    private preferences: PreferencesService,
    injector: EnvironmentInjector,
    el: ElementRef
  ) {
    const components = {
      'ce-structure-definition': StructureDefinitionTreeComponent,
      'ce-wiki-comment-popover': WikiCommentPopoverComponent
    };

    Object.keys(components)
      .filter(k => !customElements.get(k))
      .forEach(k => customElements.define(k, createCustomElement(components[k], {injector})));

    this.initCommentListener(el.nativeElement);
  }


  private initCommentListener(el: Element): void {
    let wrapper: HTMLElement;
    fromEvent(document, 'mousedown').subscribe(ev => {
      if (!wrapper?.contains(ev.target as HTMLElement)) {
        wrapper?.remove();
      }
    });

    fromEvent(document, 'selectionchange').pipe(
      debounceTime(150),
      map(() => document.getSelection()),
      filter(sel => this.commentCreated.observed && el.contains(sel.anchorNode))
    ).subscribe(sel => {
      wrapper?.remove();

      const range = sel.getRangeAt(0);
      const closestStartSourceLine = range.startContainer.parentElement.closest('[data-source-line]');
      const closestEndSourceLine = range.endContainer.parentElement.closest('[data-source-line]');
      if (range.startOffset === range.endOffset || !closestStartSourceLine || !closestEndSourceLine) {
        return;
      }

      const sourceStartLineNumber = Number(closestStartSourceLine.getAttribute('data-source-line'));
      const sourceEndLineNumber = Number(closestEndSourceLine.getAttribute('data-source-line'));
      if (sourceStartLineNumber !== sourceEndLineNumber) {
        return;
      }

      const selectedText = range.toString();
      const rangeBounds = range.getBoundingClientRect();
      const elBounds = el.getBoundingClientRect();

      wrapper = document.createElement('ce-wiki-comment-popover');
      wrapper.setAttribute('style', `
          position: absolute;
          top: ${rangeBounds.top - elBounds.top}px;
          z-index: 5;
      `);
      wrapper.addEventListener('commentCreated', (ev: CustomEvent<string>) => {
        this.commentCreated.emit({
          quote: selectedText,
          comment: ev.detail,
          line: sourceStartLineNumber
        });
      });

      // fixme: use Angular Overlay?
      el.parentElement.append(wrapper);
    });
  }
}
