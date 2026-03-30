import {Clipboard} from '@angular/cdk/clipboard';
import { Component, Input, inject } from '@angular/core';
import { MuiPopconfirmModule, MuiPopoverModule, MuiButtonModule, MuiIconModule } from '@termx-health/ui';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-copy-container',
    templateUrl: 'copy-container.component.html',
    imports: [MuiPopconfirmModule, MuiPopoverModule, MuiButtonModule, MuiIconModule, TranslatePipe]
})
export class CopyContainerComponent {
  private clipboard = inject(Clipboard);

  @Input() public text: string;

  protected copy(cb): void {
    this.clipboard.copy(this.text);
    cb.copied = true;
  }
}
