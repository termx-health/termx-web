import {Component, OnInit} from '@angular/core';
import {MuiAuthContext, MuiPageMenuItem} from '@kodality-health/marina-ui';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {LocalizedName} from '@kodality-health/marina-util';
import {filter} from 'rxjs';

@Component({
  selector: 'twa-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public menu: MuiPageMenuItem[] = [];
  public activeRoutePrivileges?: string[];

  public constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    public authContext: MuiAuthContext
  ) {}

  public ngOnInit(): void {
    this.loadMenu();

    const getLastChild = (r: ActivatedRouteSnapshot): ActivatedRouteSnapshot => {
      return r.firstChild ? getLastChild(r.firstChild) : r;
    };
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.activeRoutePrivileges = getLastChild(this.route.snapshot).data['privilege'];
    });
  }

  private loadMenu(): void {
    this.http.get<{label?: LocalizedName, icon: string, link: string}[]>("./assets/menu.json").subscribe((menu) => {
      const createMenu = (items: any[] = []): MuiPageMenuItem[] => {
        return items.map(i => ({
          label: i.label?.[this.translateService.currentLang],
          icon: i.icon,
          click: () => i.link ? this.router.navigateByUrl(i.link) : undefined,
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
