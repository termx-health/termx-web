import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {CdkPortal} from '@angular/cdk/portal';
import {Component, HostListener, Input, ViewChild} from '@angular/core';

@Component({
  selector: "tw-wiki-quick-actions-dropdown",
  template: `
    <ng-template cdk-portal>
      <ng-content></ng-content>
    </ng-template>`
})
export class WikiQuickActionsDropdownComponent {

  @Input() public reference?: HTMLElement;
  @ViewChild(CdkPortal) public contentTemplate?: CdkPortal;

  protected overlayRef?: OverlayRef;
  public showing = false;

  public constructor(protected overlay: Overlay) {}

  public show(): void {
    this.overlayRef = this.overlay.create(this.getOverlayConfig());
    this.overlayRef.attach(this.contentTemplate);
    this.syncWidth();
    this.overlayRef.backdropClick().subscribe(() => this.hide());
    this.showing = true;
  }

  public hide(): void {
    this.overlayRef?.detach();
    this.showing = false;
  }

  @HostListener('window:resize')
  public onWinResize(): void {
    this.syncWidth();
  }

  protected getOverlayConfig(): OverlayConfig {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(WikiQuickActionsDropdownComponent.getCaretCoordinates())
      .withPush(false)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }, {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
      }]);

    const scrollStrategy = this.overlay.scrollStrategies.reposition();

    return new OverlayConfig({
      positionStrategy: positionStrategy,
      scrollStrategy: scrollStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }

  private syncWidth(): void {
    if (this.overlayRef) {
      const refRect = this.reference!.getBoundingClientRect();
      this.overlayRef.updateSize({width: (refRect.width / 3)});
    }
  }

  public static getCaretCoordinates(): {x: number, y: number} {
    let x = 0, y = 0;
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
    return {x, y};
  }
}
