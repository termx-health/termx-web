import {Component, inject, Input} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {CoreUtilModule} from '@kodality-web/core-util';

@Component({
  selector: 'tw-no-privilege',
  standalone: true,
  imports: [CommonModule, TranslateModule, CoreUtilModule],
  templateUrl: 'no-privilege.component.html',
})
export class NoPrivilegeComponent {
  @Input() public privileges?: string[];
  protected router = inject(Router);
}
