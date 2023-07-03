import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';

@Component({
  selector: 'tw-collapse-panel',
  templateUrl: 'collapse-panel.component.html',
  styleUrls: ['collapse-panel.component.less']
})
export class CollapsePanelComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() public key = 'tw-collapse-panel-general';
  @Input() @BooleanInput() public collapsed: boolean | string;
  @Input() public collapsePosition: 'left' | 'right' | string = 'left';
  @Input() @BooleanInput() public resizable: boolean | string;
  @Input() public resizableMaxWidth: number = 1000;
  @Input() public resizableMinWidth: number = 200;

  // fixme: is possible to use host property (reducing div nesting), but styles MUST be without the encapsulation
  @Output() public collapsedChange = new EventEmitter<boolean>();

  @ViewChild("container") public sidebar?: ElementRef<HTMLElement>;
  protected viewInitialized: boolean;

  protected resizeData = {
    startWidth: 0,
    startCursorX: 0,
    tracking: false,
  };

  protected collapseData = {
    collapsed: false,
    inProgress: false,
  };


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['collapsed']) {
      localStorage.removeItem(this.collapseVar);
      this.setCollapsed(!!this.collapsed);
    }
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.viewInitialized = true;
      if (localStorage.getItem(this.widthVar)) {
        this.sidebar.nativeElement.style.width = localStorage.getItem(this.widthVar);
      }
      if (localStorage.getItem(this.collapseVar)) {
        this.collapseData.collapsed = localStorage.getItem(this.collapseVar) === 'true';
      }
    });

    document.addEventListener('mousemove', this._resizeMouseMove);
    document.addEventListener('mouseup', this._resizeMouseUp);
  }

  public ngOnDestroy(): void {
    removeEventListener('mousemove', this._resizeMouseMove);
    removeEventListener('mouseup', this._resizeMouseUp);
  }


  /* Resize */

  private _resizeMouseMove = (ev: MouseEvent) => this.resizeMouseMove(ev);
  private _resizeMouseUp = (ev: MouseEvent) => this.resizeMouseUp(ev);

  protected resizeMouseDown(event: MouseEvent): void {
    if (!this.resizable || this.collapseData.collapsed || this.collapseData.inProgress) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.resizeData.startWidth = this.sidebar.nativeElement.offsetWidth;
    this.resizeData.startCursorX = event.x;
    this.resizeData.tracking = true;
  }

  protected resizeMouseMove(event: MouseEvent): void {
    if (this.resizeData.tracking) {
      const cursorDelta = this.collapsePosition === 'right'
        ? this.resizeData.startCursorX - event.x
        : event.x - this.resizeData.startCursorX;

      const width = Math.min(this.resizeData.startWidth + cursorDelta, this.resizableMaxWidth);
      this.sidebar.nativeElement.style.width = Math.max(this.resizableMinWidth, width, 14) + 'px';
    }
  }

  protected resizeMouseUp(_): void {
    if (this.resizeData.tracking) {
      localStorage.setItem(this.widthVar, this.sidebar.nativeElement.style.width);
      this.resizeData.tracking = false;
    }
  }


  /* Expand */

  public toggleCollapse(): void {
    this.setCollapsed(!this.collapseData.collapsed);
  }

  public setCollapsed(collapsed: boolean): void {
    this.collapseData.inProgress = true;
    this.collapseData.collapsed = collapsed;
    setTimeout(() => {
      this.collapseData.inProgress = false;
      this.collapsedChange.emit(this.collapseData.collapsed);
      localStorage.setItem(this.collapseVar, String(this.collapseData.collapsed));
    }, 250);
  }


  /* Utils */

  private get widthVar(): string {
    return `${this.key}__width`;
  }

  private get collapseVar(): string {
    return `${this.key}__collapse`;
  }
}
