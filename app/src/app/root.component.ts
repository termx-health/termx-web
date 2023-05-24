import {Component} from '@angular/core';

@Component({
  selector: 'tw-root',
  template: `
    <router-outlet/>
    <m-http-error-notification/>
  `
})
export class RootComponent {
}
