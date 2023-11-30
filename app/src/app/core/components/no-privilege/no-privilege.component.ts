import {Component, inject, Input} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-no-privilege',
  standalone: true,
  imports: [CommonModule, TranslateModule, CoreUtilModule, MarinaUiModule],
  templateUrl: 'no-privilege.component.html',
})
export class NoPrivilegeComponent {
  @Input() public privileges?: string[];
  protected router = inject(Router);
}
