import {Component} from '@angular/core';
import {MuiMenuItem} from '@kodality-health/marina-ui';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public menu: MuiMenuItem[] = [
    {
      icon: 'unordered-list',
      label: 'CS list',
      click: () => this.router.navigateByUrl('code-systems')
    },
    {
      icon: 'plus',
      label: 'CS add',
      click: () => this.router.navigateByUrl('code-systems/add')
    }
  ];

  public constructor(private router: Router) {}
}
