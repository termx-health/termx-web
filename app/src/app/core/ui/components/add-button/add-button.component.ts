import {Component, Input} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import {MuiBreakpointService} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-add-button',
  templateUrl: 'add-button.component.html',
  host: {
    '[tabIndex]' : `-1`
  }
})
export class AddButtonComponent {
  @Input() public icon: string = 'plus';
  @Input() public placement: 'left' | 'right' = 'left';
  @Input() public size: number = 12;
  @Input() @BooleanInput() public disabled: string | boolean;

  public isDesktop = true;

  public constructor(breakpointService: MuiBreakpointService) {
    breakpointService.observe().subscribe(v => this.isDesktop = !v.matches);
  }
}
