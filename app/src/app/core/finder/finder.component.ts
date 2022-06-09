import {Component, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';


@Component({
  selector: 'twa-finder-item',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *stringTemplateOutlet="title" class="tw-finder-title">{{title | toString | translate}}</div>
    <ng-content></ng-content>
  `
})
export class FinderItemComponent {
  @Input() public title?: string | TemplateRef<void>;
}


@Component({
  selector: 'twa-finder-menu-item',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *ngIf="!navigate">
      <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
    </div>


    <div *ngIf="navigate">
      <a [routerLink]="navigate" routerLinkActive="tw-finder-menu-item-active">
        <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
      </a>
      <m-button *ngIf="view.observed" mSize="small" mDisplay="text" mShape="circle" (click)="view.emit()">
        <m-icon mCode="eye"></m-icon>
      </m-button>
    </div>

    <ng-template #contentTpl>
      <ng-content></ng-content>
    </ng-template>
  `,
  host: {
    '[class.tw-finder-menu-item]': 'true'
  }
})
export class FinderMenuItemComponent {
  @Input() public navigate?: any[] | string | null;
  @Output() public view = new EventEmitter<void>();
}


@Component({
  selector: 'twa-finder-menu',
  encapsulation: ViewEncapsulation.None,
  template: `
    <m-spinner [mLoading]="loading">
      <div *stringTemplateOutlet="title" class="tw-finder-title">
        <m-button (click)="toggleOpen()" mSize="small" mDisplay="text" mShape="circle">
          <m-icon [mCode]="open ? 'folder-open' : 'folder'"></m-icon>
        </m-button>
        {{title | toString | translate}}
      </div>

      <div *ngIf="open">
        <ng-content></ng-content>
        <div *ngIf="length === 0" class="tw-finder-menu-item">No data</div>
      </div>
    </m-spinner>
  `
})
export class FinderMenuComponent {
  @Input() public title?: string | TemplateRef<void>;
  @Input() public length: number = -1;
  @Input() @BooleanInput() public loading: string | boolean = false;
  @Input() @BooleanInput() public open: string | boolean = true;
  @Output() public openChange = new EventEmitter<boolean>();


  public toggleOpen(): void {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }
}


@Component({
  selector: 'twa-finder-wrapper',
  styleUrls: ['finder.component.less'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <router-outlet>
      <div class="tw-finder-wrapper-inner">
        <m-spinner [mLoading]="loading">
          <div class="tw-finder-outlet">
            <ng-content></ng-content>
          </div>
        </m-spinner>
      </div>
    </router-outlet>
    <!-- router components are injected here -->
  `,
  host: {
    '[class.tw-finder-wrapper]': `true`
  }
})
export class FinderWrapperComponent {
  @Input() @BooleanInput() public loading: string | boolean = false;
}
