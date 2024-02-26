import {BreakpointState} from '@angular/cdk/layout';
import {Location} from '@angular/common';
import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BooleanInput, NumberInput} from '@kodality-web/core-util';
import {MuiBreakpointService} from '@kodality-web/marina-ui';


@Component({
  selector: 'tw-finder-load-more-item',
  template: `
    <tw-finder-menu-item>
      <a class="tw-finder-load-more" (click)="twClick.emit()">
        Load more
      </a>
    </tw-finder-menu-item>
  `
})
export class FinderLoadMoreItemComponent {
  @Output() public twClick = new EventEmitter<void>();
}

@Component({
  selector: 'tw-finder-menu-item',
  template: `
    <div *ngIf="!navigate">
      <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
    </div>


    <div *ngIf="navigate" class="m-justify-between">
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
  selector: 'tw-finder-menu',
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
        <div *ngIf="length === 0" class="tw-finder-menu-item">
          {{'core.no-data' | translate}}
        </div>
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
  selector: 'tw-finder-wrapper',
  styleUrls: ['finder.component.less'],
  template: `
    <m-card class="tw-finder-wrapper-inner" style="height: min-content" m-scrollable *ngIf="isDisplayed">
      <ng-container *ngIf="title || isMobile">
        <ng-container *m-card-header>
          <a *ngIf="isMobile" (click)="location.back()" class="tw-finder-wrapper-header-navigation tw-finder-title">
            <m-icon mCode="left"></m-icon>&nbsp; {{'core.back' | translate}}
          </a>
          <div *ngIf="title" class="tw-finder-wrapper-header-title">
            {{title | translate}}
          </div>
        </ng-container>
      </ng-container>

      <m-card [mShowSkeleton]="loading" class="m-card-inside">
        <div class="tw-finder-outlet">
          <ng-content></ng-content>
        </div>
      </m-card>
    </m-card>

    <router-outlet></router-outlet>
  `,
  host: {
    class: 'tw-finder-wrapper'
  }
})
export class FinderWrapperComponent implements AfterViewInit {
  @Input() public title?: string;
  @Input() @BooleanInput() public loading: string | boolean = false;

  public isMobile: boolean = false;

  public constructor(
    public location: Location,
    private route: ActivatedRoute,
    private elRef: ElementRef,
    breakpointService: MuiBreakpointService
  ) {
    breakpointService.observe().subscribe((state: BreakpointState) => this.isMobile = state.matches);
  }

  public get isDisplayed(): boolean {
    return this.isMobile ? !this.route.firstChild : true;
  }

  public ngAfterViewInit(): void {
    if (!this.route.firstChild) {
      (this.elRef.nativeElement as HTMLElement).scrollIntoView({behavior: 'smooth'});
    }
  }
}
