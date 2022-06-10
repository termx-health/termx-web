import {Component, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation} from '@angular/core';
import {BooleanInput, NumberInput} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {takeUntil} from 'rxjs';
import {Location} from '@angular/common';


@Component({
  selector: 'twa-finder-menu-item',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *ngIf="!navigate">
      <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
    </div>


    <div *ngIf="navigate" class="tw-items-between">
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
  @Input() @NumberInput() public length: number = 0;
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
    <m-card class="tw-finder-wrapper-inner" *ngIf="isDisplayed">
      <ng-container *ngIf="title || isMobile">
        <ng-container *m-card-header>
          <div *ngIf="title">
            {{title}}
          </div>
          <a *ngIf="isMobile" (click)="location.back()">
            <m-icon mCode="left"></m-icon>&nbsp; Back
          </a>
        </ng-container>
      </ng-container>

      <m-spinner [mLoading]="loading" style="display: block">
        <div class="tw-finder-outlet">
          <ng-content></ng-content>
        </div>
      </m-spinner>
    </m-card>

    <router-outlet></router-outlet>
  `,
  host: {
    '[class.tw-finder-wrapper]': `true`
  }
})
export class FinderWrapperComponent {
  @Input() public title?: string;
  @Input() @BooleanInput() public loading: string | boolean = false;

  public isMobile: boolean = false;

  public constructor(
    public location: Location,
    private route: ActivatedRoute,
    breakpointObserver: BreakpointObserver,
    destroy$: MuiDestroyService
  ) {
    breakpointObserver.observe(['(max-width: 768px)']).pipe(takeUntil(destroy$)).subscribe((state: BreakpointState) => this.isMobile = state.matches);
  }

  public get isDisplayed(): boolean {
    return this.isMobile ? !this.route.firstChild : true;
  }
}
