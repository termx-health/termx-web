import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MuiHttpErrorNotificationModule } from '@kodality-web/marina-ui';

@Component({
    selector: 'tw-root',
    template: `
    <router-outlet/>
    <m-http-error-notification/>
  `,
    imports: [RouterOutlet, MuiHttpErrorNotificationModule]
})
export class RootComponent {
}
