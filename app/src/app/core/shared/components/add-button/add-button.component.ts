import {Component} from '@angular/core';
import {MuiBreakpointService} from '@kodality-health/marina-ui';

@Component({
  selector: 'twa-add-button',
  templateUrl: 'add-button.component.html'
})
export class AddButtonComponent {
  public isDesktop = true;

  public constructor(breakpointService: MuiBreakpointService) {
    breakpointService.observe().subscribe(v => this.isDesktop = !v.matches);
  }
}
