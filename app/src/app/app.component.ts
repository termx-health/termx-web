import {Component, OnInit} from '@angular/core';
import {MuiPageMenuItem} from '@kodality-web/marina-ui';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {LocalizedName} from '@kodality-web/marina-util';
import {filter} from 'rxjs';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {AuthService} from './auth/auth.service';

@Component({
  selector: 'twa-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public menu: MuiPageMenuItem[] = [];
  public activeRoutePrivileges?: string[];
  public pageType?: string;

  public constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private oidcSecurityService: OidcSecurityService
  ) {}

  public ngOnInit(): void {
    this.loadMenu();

    const getLastChild = (r: ActivatedRouteSnapshot): ActivatedRouteSnapshot => {
      return r.firstChild ? getLastChild(r.firstChild) : r;
    };
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.activeRoutePrivileges = getLastChild(this.route.snapshot).data['privilege'];
      this.pageType = getLastChild(this.route.snapshot).data['pageType'];
    });
  }

  public logout(): void {
    this.oidcSecurityService.logoff();
  }

  private loadMenu(): void {
    this.http.get<{label?: LocalizedName, icon: string, link: string}[]>("./assets/menu.json").subscribe((menu) => {
      const createMenu = (items: any[] = []): MuiPageMenuItem[] => {
        return this.filter(items).map(i => ({
          label: i.label?.[this.translateService.currentLang],
          icon: i.icon,
          click: () => i.link ? this.router.navigateByUrl(i.link) : undefined,
          items: createMenu(i.items)
        }));
      };
      this.menu = createMenu(menu);
    });
  }

  private filter(items: any[]): any[] {
    return items.filter(item => !item.privileges || this.authService.hasAnyPrivilege(item.privileges));
  }

  public onLangChange(lang: string): void {
    this.translateService.use(lang);
    this.loadMenu();
  }
}
