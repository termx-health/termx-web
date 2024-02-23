import {Clipboard} from '@angular/cdk/clipboard';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'tw-copy-container',
  templateUrl: 'copy-container.component.html'
})
export class CopyContainerComponent {
  @Input() public text: string;

  public constructor(private clipboard: Clipboard) {}

  protected copy(cb): void {
    this.clipboard.copy(this.text);
    cb.copied = true;
  }
}
