import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {collect, compareDates, isNil, sort} from '@kodality-web/core-util';
import {PageComment, PageContent} from 'term-web/wiki/_lib';
import {ExtendedPageComment} from 'term-web/wiki/page/components/wiki-page-comment.component';
import {NgChanges} from '@kodality-web/marina-ui';


@Component({
  selector: 'tw-wiki-page-comments',
  templateUrl: 'wiki-page-comments.component.html',
  styles: [`
    :host {
      position: relative;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: var(--gap-default)
    }
  `]
})
export class WikiPageCommentsComponent implements OnChanges {
  @Input() public mode: 'feed' | 'bubbles' = 'feed';
  @Input() public pageContent: PageContent;

  @Input() public pageComments: ExtendedPageComment[] = []; // active comments
  @Output() public pageCommentsChange = new EventEmitter<PageComment[]>();

  @Input() public containerOffset: number;
  @Input() public lineOffset: (nr: number) => number;
  protected trigger = {};


  public ngOnChanges(changes: NgChanges<WikiPageCommentsComponent>): void {
    if (changes['pageComments']) {
      const map = collect(this.pageComments, c => c.parentId);
      this.pageComments = this.pageComments
        .filter(c => isNil(c.parentId))
        .map(c => ({
          ...c,
          children: (map[c.id] ?? []).sort((a, b): number => compareDates(new Date(a.createdAt), new Date(b.createdAt)))
        }));
    }

    if (changes['mode'] || changes['pageComments'] || changes['containerOffset'] || changes['lineOffset']) {
      this.recalcPositions();
    }
  }

  protected fireOnChange(): void {
    this.pageCommentsChange.emit(
      this.pageComments.flatMap(c => [c, ...c.children ?? []])
    );
  }


  /* PageComments */

  protected onCommentDelete(com: PageComment): void {
    this.pageComments = this.pageComments.filter(c => c.id !== com.id);
    this.fireOnChange();
  }

  protected onCommentResolve(com: PageComment): void {
    this.pageComments = this.pageComments.filter(c => c.id !== com.id);
    this.fireOnChange();
  }


  /* Position */

  protected recalcPositions(): void {
    setTimeout(() => this.trigger = {});
  }

  protected getCommentStyle = (com: PageComment, idx: number, _ngTrigger?: any): string => {
    if (this.mode === 'feed' || isNil(this.lineOffset)) {
      return undefined;
    }

    const lineNr = com.options?.lineNumber;
    const lineOffset = this.lineOffset(lineNr);

    let prevOffsetBottom = 0;
    if (idx > 0) {
      const prevEl = document.querySelectorAll<HTMLElement>('tw-wiki-page-comment').item(idx - 1);
      prevOffsetBottom = prevEl.offsetTop + prevEl.offsetHeight;
    }

    return `position: absolute; left: 0; right: 0; top: ${Math.max(0, lineOffset - this.containerOffset ?? 0, prevOffsetBottom + 7)}px;`;
  };


  /* Utils */

  protected sorted = (comments: ExtendedPageComment[], _ngTrigger?: any): ExtendedPageComment[] => {
    return this.mode === 'feed'
      ? comments.sort((a, b): number => compareDates(new Date(a.createdAt), new Date(b.createdAt)))
      : sort(comments, 'options.lineNumber');
  };
}
