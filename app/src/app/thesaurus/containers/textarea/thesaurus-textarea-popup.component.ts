import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'twa-thesaurus-textarea-popup',
  template: `
    <nz-list id="popup" class="tw-textarea-popup" nzItemLayout="horizontal" nzBordered>
      <nz-list-item *ngFor="let item of popupItems; let i = index" (click)="takeAction(item.name)">
        <nz-list-item-meta>
          <nz-list-item-meta-avatar>
            <m-icon [mCode]="item.icon"></m-icon>
          </nz-list-item-meta-avatar>
          <nz-list-item-meta-title>{{item.name}}</nz-list-item-meta-title>
          <nz-list-item-meta-description>{{ item.description }}</nz-list-item-meta-description>
        </nz-list-item-meta>
      </nz-list-item>
    </nz-list>
  `,
  styles: [`
    .tw-textarea-popup ::ng-deep {
      position: absolute;
      top: 0;
      left: 0;
      width: 200px;
      max-height: 150px;
      display: none;
      background: white;
      border-radius: 0.25rem;
      padding: 0.4rem;

      overflow: scroll;
      overflow-x: hidden;

      .ant-list-item {
        cursor: pointer;

        &:hover, &:focus, &:active {
          background: hsv(0, 0, 96%);
        }
      }
    }
  `],
})
export class ThesaurusTextareaPopupComponent {
  @Input() public editorType: 'wysiwyg' | 'markdown' = 'markdown';
  @Output() public res = new EventEmitter<string>();

  public popupItems: {name: string, icon: string, description: string, action: string}[] = [
    {name: 'Link', icon: 'link', description: 'Insert a link', action: 'link'},
    {name: 'Bullet list', icon: 'unordered-list', description: 'Create an unordered list', action: 'list'}
  ];

  public togglePopup(hide?: boolean): void {
    const tooltip = document.getElementById("popup");
    if (!hide) {
      const {x, y} = ThesaurusTextareaPopupComponent.getCaretCoordinates();
      tooltip?.setAttribute("style", `display: inline-block; left: ${x}px; top: ${y}px`);
    } else {
      tooltip?.setAttribute("style", `display: none`);
    }
  }

  private static getCaretCoordinates(): any {
    let x = 0, y = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount !== 0) {
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(true);
        const rect = range.getBoundingClientRect();
        if (rect) {
          x = rect.left;
          y = rect.top;
        }
      }
    }
    return {x, y};
  }

  public takeAction(name: string) {
    const action = this.popupItems.find(i => i.name === name)?.action;
    if (action === 'link') {
    }
    if (action === 'list') {
      this.res.emit('\n* ');
    }
  }

}
