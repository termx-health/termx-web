import {Component, EventEmitter, Input, Output} from '@angular/core';
import {compareDates, isDefined, isNil} from '@kodality-web/core-util';
import {AuthService} from 'term-web/core/auth';
import {PageComment, PageContent} from 'term-web/wiki/_lib';
import {PageCommentService} from 'term-web/wiki/page/services/page-comment.service';

export interface ExtendedPageComment extends PageComment {
  children?: PageComment[]
}

interface CommentPrivileges {
  resolve: boolean,
  edit: boolean,
  delete: boolean,
}


@Component({
  selector: 'tw-wiki-page-comment',
  templateUrl: 'wiki-page-comment.component.html',
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
  `],
  host: {
    '[attr.page-comment-id]': `pageComment?.id`,
    '[attr.line-number]': `pageComment?.options?.lineNumber`,
  }
})
export class WikiPageCommentComponent {
  @Input() public pageContent: PageContent;

  @Input() public pageComment: ExtendedPageComment;
  @Output() public pageCommentChange = new EventEmitter<ExtendedPageComment>();

  @Output() public commentDeleted = new EventEmitter<PageComment>();
  @Output() public commentResolved = new EventEmitter<PageComment>();

  protected _editState: {[id: number]: string} = {};

  public constructor(
    private pageCommentService: PageCommentService,
    private authService: AuthService
  ) { }


  /* Edit */

  protected startEdit(c: PageComment): void {
    this._editState[c.id] = c.comment;
  }

  protected cancelEdit(c: PageComment): void {
    this._editState[c.id] = undefined;
  }


  /* PageComments */

  protected updateContent(pc: PageComment, content: string): void {
    this.pageCommentService.save({...pc, comment: content}).subscribe(() => {
      pc.comment = content;
      this.pageCommentChange.emit(this.pageComment);
      this.cancelEdit(pc);
    });
  }

  protected delete(pc: PageComment): void {
    this.pageCommentService.delete(pc.id).subscribe(() => {
      if (isDefined(pc.parentId)) {
        this.pageComment.children = this.pageComment.children.filter(c => c.id !== pc.id);
        this.pageCommentChange.emit(this.pageComment);
      } else {
        this.commentDeleted.emit(pc);
      }
    });
  }

  protected resolve(comment: PageComment): void {
    this.pageCommentService.resolve(comment.id).subscribe(resp => {
      this.pageCommentChange.emit(resp);
      this.commentResolved.emit(resp);
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
      this.pageCommentChange.emit(this.pageComment);
    });
  }


  /* Utils */

  protected calcPrivileges = (c: PageComment, content: string): CommentPrivileges => {
    const status = (s): boolean => c.status === s;
    const isCommentAuthor = this.isCommentAuthor(c);
    const isParentCommentAuthor = isDefined(c.parentId) && this.isCommentAuthor(this.pageComment);
    const isRoot = isNil(c.parentId);
    const hasPrivileges = this.authService.hasPrivilege(`*.Wiki.edit`);

    return {
      resolve: isRoot && status('active') && hasPrivileges,
      edit: isCommentAuthor && isNil(content) && hasPrivileges,
      delete: (isCommentAuthor || isParentCommentAuthor) && hasPrivileges,
    };
  };

  protected isCommentAuthor = (c: PageComment): boolean => {
    return c.createdBy === this.authService.user?.username;
  };

  private commentsSorted() {
    return (a, b): number => compareDates(new Date(a.createdAt), new Date(b.createdAt));
  };
}
