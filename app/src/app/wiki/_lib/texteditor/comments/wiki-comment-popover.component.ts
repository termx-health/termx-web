import {Component, EventEmitter, Output} from '@angular/core';
import {AuthService} from 'term-web/core/auth';

@Component({
  selector: 'tw-wiki-comment-popover',
  template: `
    <m-icon-button *ngIf="!commentData.edit" class="btn" mIcon="comment" mSize="small" (mClick)="open()"/>

    <m-card *ngIf="commentData.edit" mDisplay="raised" style="box-shadow: var(--shadow-large)">
      <div style="font-weight: bold; font-size: 0.9rem">
        {{auth.user.username}}
      </div>

      <div style="margin-block: 0.5rem">
        <m-textarea [(ngModel)]="commentData.content" [autosize]="{minRows: 2}"/>
      </div>

      <div class="m-items-middle">
        <m-button mDisplay="primary" mSize="small" (mClick)="commentConfirm()">Comment</m-button>
        <m-button mSize="small" (mClick)="commentCancel()">Cancel</m-button>
      </div>
    </m-card>
  `,
  host: {
    '[style.left]': `commentData.edit ? "1rem" : "-0.5rem"`,
    '[style.width]': `commentData.edit ? "35%" : 'initial'`,
    '[style.transform]': `commentData.edit ? 'translateY(0%)' : 'translateY(50%)'`,
  },
  styles: [`
    ::ng-deep .btn button {
      background: var(--color-primary-6);
      color: white;

      box-shadow: var(--shadow-large);
      border-radius: 50%;
    }
  `]
})
export class WikiCommentPopoverComponent {
  @Output() public commentCreated = new EventEmitter<string>();

  public constructor(protected auth: AuthService) {}

  protected commentData: {edit: boolean, content?: string} = {
    edit: false
  };

  protected open(): void {
    this.commentData = {edit: true};
  }

  protected close(): void {
    this.commentData = {edit: false};
  }

  protected commentConfirm(): void {
    this.commentCreated.emit(this.commentData.content);
    this.close();
  }

  protected commentCancel(): void {
    this.close();
  }
}
