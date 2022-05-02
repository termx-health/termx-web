import {Component, OnInit} from '@angular/core';
import {MuiMenuItem} from '@kodality-health/marina-ui';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {LocalizedName} from '@kodality-health/marina-util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public menu: MuiMenuItem[] = [
    {
      icon: 'unordered-list',
      label: 'menu.code-system.list',
      click: () => this.router.navigateByUrl('code-systems')
    },
    {
      icon: 'plus',
      label: 'menu.code-system.add',
      click: () => this.router.navigateByUrl('code-systems/add')
    }
  ];

  public constructor(
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.http.get<{label?: LocalizedName, icon: string, link: string}[]>("/assets/menu.json").subscribe((menu) => {
      this.menu = menu.map(i => ({label: i.label?.[this.translateService.currentLang], icon: i.icon, click: () => this.router.navigateByUrl(i.link)}))
    })
  }

  public onLangChange(lang: string): void {
    this.translateService.use(lang);
    this.loadMenu()
  }
}
