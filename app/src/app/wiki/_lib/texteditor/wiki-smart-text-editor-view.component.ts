import {Component, ElementRef, EnvironmentInjector, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib';
import {debounceTime, filter, fromEvent, map} from 'rxjs';
import {WikiCommentPopoverComponent} from '../texteditor/comments/wiki-comment-popover.component';
import {WikiComment} from '../texteditor/comments/wiki-comment';
import {NgChanges} from '@kodality-web/marina-ui';
import {group, isDefined} from '@kodality-web/core-util';

@Component({
  selector: 'tw-smart-text-editor-view',
  templateUrl: 'wiki-smart-text-editor-view.component.html',
  styles: [`
    ::ng-deep tw-smart-text-editor-view .ql-editor {
      padding: 0;
    }
  `]
})
export class WikiSmartTextEditorViewComponent implements OnChanges {
  @Input() public value?: string;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public prerender?: boolean; // markdown option

  @Input() public comments: WikiComment[];
  @Output() public commentCreated = new EventEmitter<WikiComment>();

  public constructor(
    private el: ElementRef<HTMLElement>,
    injector: EnvironmentInjector,
  ) {
    const components = {
      'ce-structure-definition': StructureDefinitionTreeComponent,
      'ce-wiki-comment-popover': WikiCommentPopoverComponent
    };

    Object.keys(components)
      .filter(k => !customElements.get(k))
      .forEach(k => customElements.define(k, createCustomElement(components[k], {injector})));

    setTimeout(() => this.initCommentListener(el.nativeElement));
  }


  public ngOnChanges(changes: NgChanges<WikiSmartTextEditorViewComponent>): void {
    if (changes['comments']) {
      this.displayCommentIndications();
    }
  }

  private displayCommentIndications(): void {
    const sourceLineEls = this.el.nativeElement.querySelectorAll<HTMLElement>('[data-source-line]');
    const comments = group(this.comments ?? [], c => c.line)

    sourceLineEls.forEach(el => {
      const ln = el.getAttribute('data-source-line');
      el.classList.remove('comment--marked');

      const comment = comments[ln];
      if (isDefined(comment)) {
        el.classList.add('comment--marked');
      }
    });
  }


  private initCommentListener(el: Element): void {
    // todo: observe DOM changes in the current element to reposition comments

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
          top: ${rangeBounds.top - elBounds.top - 24}px;
          left: ${((rangeBounds.left + rangeBounds.right) / 2) - elBounds.left}px;
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
