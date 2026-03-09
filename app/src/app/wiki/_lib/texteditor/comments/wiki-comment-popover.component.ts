import { Component, EventEmitter, Output, inject } from '@angular/core';
import {AuthService} from 'term-web/core/auth';

import { MuiIconButtonModule, MuiCardModule, MuiTextareaModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tw-wiki-comment-popover',
    template: `
    @if (!commentData.edit) {
      <m-icon-button class="btn" mIcon="comment" mSize="small" (mClick)="open()"/>
    }
    
    @if (commentData.edit) {
      <m-card mDisplay="raised" style="box-shadow: var(--shadow-large)">
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
    }
    `,
    host: {
        '[style.width]': `commentData.edit ? "35%" : 'initial'`,
    },
    styles: [`
    ::ng-deep .btn button {
      background: var(--color-primary-6);
      color: white;

      box-shadow: var(--shadow-large);
      border-radius: 50%;
    }
  `],
    imports: [MuiIconButtonModule, MuiCardModule, MuiTextareaModule, FormsModule, MuiButtonModule]
})
export class WikiCommentPopoverComponent {
  protected auth = inject(AuthService);

  @Output() public commentCreated = new EventEmitter<string>();

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
