import {Highlightable} from '@angular/cdk/a11y';
import {Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'tw-dropdown-option',
  template: `
    <nz-list-item-meta [id]="item.id">
      <nz-list-item-meta-avatar>
        <m-icon [mCode]="item.icon"></m-icon>
      </nz-list-item-meta-avatar>
      <nz-list-item-meta-title>{{item.name}}</nz-list-item-meta-title>
      <nz-list-item-meta-description *ngIf="item.description">{{ item.description }}</nz-list-item-meta-description>
    </nz-list-item-meta>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0.875rem;
      background-color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      cursor: pointer;

      &:hover, &.active {
        outline: none;
        background-color: #eee;

        @media screen and (-ms-high-contrast: active) {
          background-color: #eee;
        }
      }
    }`]
})
export class ThesaurusDropdownOptionComponent implements Highlightable {
  @Input() public item?: ThesaurusDropdownOptionItem;

  @HostBinding('class.active')
  public active = false;

  public constructor() {}

  public setActiveStyles(): void {
    this.active = true;
  }

  public setInactiveStyles(): void {
    this.active = false;
  }
}

export class ThesaurusDropdownOptionItem {
  public id: string;
  public icon: string;
  public name: string;
  public description?: string;
}
