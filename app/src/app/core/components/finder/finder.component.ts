import {BreakpointState} from '@angular/cdk/layout';
import { Location, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, TemplateRef, forwardRef, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router';
import { BooleanInput, NumberInput, StringTemplateOutletDirective, ToStringPipe } from '@termx-health/core-util';
import { MuiBreakpointService, MuiCardModule, MuiCoreModule, MuiIconModule, MuiSpinnerModule, MuiButtonModule } from '@termx-health/ui';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-finder-load-more-item',
    template: `
    <tw-finder-menu-item>
      <a class="tw-finder-load-more" (click)="twClick.emit()">
        Load more
      </a>
    </tw-finder-menu-item>
  `,
    imports: [forwardRef(() => FinderMenuItemComponent), MuiCoreModule]
})
export class FinderLoadMoreItemComponent {
  @Output() public twClick = new EventEmitter<void>();
}

@Component({
    selector: 'tw-finder-menu-item',
    template: `
    @if (!navigate) {
      <div>
        <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
      </div>
    }
    
    
    @if (navigate) {
      <div class="m-justify-between">
        <a [routerLink]="navigate" routerLinkActive="tw-finder-menu-item-active">
          <ng-container *ngTemplateOutlet="contentTpl"></ng-container>
        </a>
        @if (view.observed) {
          <m-button mSize="small" mDisplay="text" mShape="circle" (click)="view.emit()">
            <m-icon mCode="eye"></m-icon>
          </m-button>
        }
      </div>
    }
    
    <ng-template #contentTpl>
      <ng-content></ng-content>
    </ng-template>
    `,
    host: {
        '[class.tw-finder-menu-item]': 'true'
    },
    imports: [NgTemplateOutlet, MuiCoreModule, RouterLinkActive, RouterLink, MuiButtonModule, MuiIconModule]
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
    
      @if (open) {
        <div>
          <ng-content></ng-content>
          @if (length === 0) {
            <div class="tw-finder-menu-item">
              {{'core.no-data' | translate}}
            </div>
          }
        </div>
      }
    </m-spinner>
    `,
    imports: [MuiSpinnerModule, StringTemplateOutletDirective, MuiButtonModule, MuiIconModule, ToStringPipe, TranslatePipe]
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
    @if (isDisplayed) {
      <m-card class="tw-finder-wrapper-inner" style="height: min-content" m-scrollable>
        @if (title || isMobile) {
          <ng-container *m-card-header>
            @if (isMobile) {
              <a (click)="location.back()" class="tw-finder-wrapper-header-navigation tw-finder-title">
                <m-icon mCode="left"></m-icon>&nbsp; {{'core.back' | translate}}
              </a>
            }
            @if (title) {
              <div class="tw-finder-wrapper-header-title">
                {{title | translate}}
              </div>
            }
          </ng-container>
        }
        <m-card [mShowSkeleton]="loading" class="m-card-inside">
          <div class="tw-finder-outlet">
            <ng-content></ng-content>
          </div>
        </m-card>
      </m-card>
    }
    
    <router-outlet></router-outlet>
    `,
    host: {
        class: 'tw-finder-wrapper'
    },
    imports: [MuiCardModule, MuiCoreModule, MuiIconModule, RouterOutlet, TranslatePipe]
})
export class FinderWrapperComponent implements AfterViewInit {
  protected location = inject(Location);
  private route = inject(ActivatedRoute);
  private elRef = inject(ElementRef);

  @Input() public title?: string;
  @Input() @BooleanInput() public loading: string | boolean = false;

  public isMobile: boolean = false;

  public constructor() {
    const breakpointService = inject(MuiBreakpointService);

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
