import {DOCUMENT} from '@angular/common';
import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MuiHttpErrorNotificationModule } from '@termx-health/ui';
import {NzIconService} from 'ng-zorro-antd/icon';

@Component({
    selector: 'tw-root',
    template: `
    <router-outlet/>
    <m-http-error-notification/>
  `,
    imports: [RouterOutlet, MuiHttpErrorNotificationModule]
})
export class RootComponent {
  public constructor() {
    const document = inject(DOCUMENT);
    const nzIconService = inject(NzIconService);
    const baseHref = document.querySelector('base')?.getAttribute('href') || '/';

    nzIconService.changeAssetsSource(baseHref);
  }
}
