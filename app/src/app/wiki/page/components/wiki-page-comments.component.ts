import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {collect, compareDates, isDefined, isNil, remove} from '@kodality-web/core-util';
import {PageComment, PageContent} from 'term-web/wiki/_lib';
import {PageCommentService} from 'term-web/wiki/page/services/page-comment.service';
import {AuthService} from 'term-web/core/auth';

interface ExtendedPageComment extends PageComment {
  children?: PageComment[]
}

interface CommentPrivileges {
  resolve: boolean,
  edit: boolean,
  delete: boolean,
}

@Component({
  selector: 'tw-wiki-page-comments',
  templateUrl: 'wiki-page-comments.component.html',
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      gap: var(--gap-default)
    }

    .comment-author {
      .comment-creator {
        font-weight: bold;
        font-size: 0.9rem;
        word-break: break-word
      }

      .comment-date {
        color: var(--color-text-secondary);
        font-size: 0.75rem;
        margin-top: -.2rem
      }
    }

    .quote {
      background: var(--color-yellow-0);
      color: var(--color-yellow-9);
      border-left: 2px solid var(--color-yellow-6);
      margin: 0;
      padding: 0.2em 0.6rem;
    }

    .curtain {
      background: linear-gradient(to bottom, transparent, var(--color-background-component));
      height: 2rem;
      margin-top: -2rem;
      position: relative;

      .m-list-item--selectable:hover & {
        --color-background-component: #fafafa;
      }
    }
  `]
})
export class WikiPageCommentsComponent implements OnChanges {
  @Input() public pageContent: PageContent;
  @Input() public pageComments: ExtendedPageComment[] = []; // active comments
  @Output() public pageCommentsChange = new EventEmitter<PageComment[]>();
  @Output() public commentResolved = new EventEmitter<PageComment>();

  protected editState = {};

  public constructor(
    private pageCommentService: PageCommentService,
    private authService: AuthService
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageComments']) {
      const map = collect(this.pageComments, c => c.parentId);
      this.pageComments = this.pageComments
        .filter(c => isNil(c.parentId))
        .map(c => ({...c, children: (map[c.id] ?? []).sort(this.commentsSorted())}))
        .sort(this.commentsSorted());
    }
  }

  private fireOnChange(): void {
    const flat = this.pageComments
      .flatMap(c => [c, ...c.children ?? []])
      .sort(this.commentsSorted());
    this.pageCommentsChange.emit(flat);
  }


  /* Edit */

  protected startEdit(c: PageComment): void {
    this.editState[c.id] = c.comment;
  }

  protected cancelEdit(c: PageComment): void {
    delete this.editState[c.id];
  }


  /* PageComments */

  protected updateContent(comment: PageComment, content: string): void {
    this.pageCommentService.save({...comment, comment: content}).subscribe(() => {
      comment.comment = content;
      this.fireOnChange();
      this.cancelEdit(comment);
    });
  }

  protected delete(comment: PageComment): void {
    this.pageCommentService.delete(comment.id).subscribe(() => {
      if (isDefined(comment.parentId)) {
        const parent = this.pageComments.find(c => c.id === comment.parentId);
        parent.children = parent.children.filter(c => c.id !== comment.id);
      } else {
        this.pageComments = this.pageComments.filter(c => c.id !== comment.id);
      }
      this.fireOnChange();
    });
  }

  protected resolve(comment: PageComment): void {
    this.pageCommentService.resolve(comment.id).subscribe(resp => {
      remove(this.pageComments, comment);
      this.commentResolved.emit(resp);
      this.fireOnChange();
    });
  }


  protected reply(parent: ExtendedPageComment, msg: string): void {
    this.pageCommentService.reply(parent.id, {
      pageContentId: this.pageContent.id,
      comment: msg,
      status: 'active',
    }).subscribe(resp => {
      parent.children ??= [];
      parent.children = [...parent.children, resp].sort(this.commentsSorted());
      this.fireOnChange();
    });
  }


  /* Utils */

  protected calcPrivileges = (c: PageComment, state: {[id: number]: string}): CommentPrivileges => {
    const status = (s): boolean => c.status === s;
    const isCommentAuthor = this.isCommentAuthor(c);
    const isParentCommentAuthor = isDefined(c.parentId) && this.isCommentAuthor(this.pageComments.find(pc => pc.id === c.parentId));
    const isRoot = isNil(c.parentId);

    return {
      resolve: isRoot && status('active'),
      edit: isCommentAuthor && !state[c.id],
      delete: isCommentAuthor || isParentCommentAuthor,
    };
  };

  protected isCommentAuthor = (c: PageComment): boolean => {
    return c.createdBy === this.authService.user.username;
  };

  private commentsSorted() {
    return (a, b): number => compareDates(new Date(a.createdAt), new Date(b.createdAt));
  };
}
