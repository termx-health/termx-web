import {Component, OnInit} from '@angular/core';
import {MuiMenuItem} from '@kodality-health/marina-ui';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {LocalizedName} from '@kodality-health/marina-util';

@Component({
  selector: 'twa-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public menu: MuiMenuItem[] = [];

  public constructor(
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.http.get<{label?: LocalizedName, icon: string, link: string}[]>("./assets/menu.json").subscribe((menu) => {
      const createMenu = (items: any[] = []): MuiMenuItem[] => {
        return items.map(i => ({
          label: i.label?.[this.translateService.currentLang],
          icon: i.icon,
          click: () => this.router.navigateByUrl(i.link),
          items: createMenu(i.items)
        }));
      };
      this.menu = createMenu(menu);
    });
  }

  public onLangChange(lang: string): void {
    this.translateService.use(lang);
    this.loadMenu();
  }
}
