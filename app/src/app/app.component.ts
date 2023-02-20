import {Component, OnInit} from '@angular/core';
import {MuiPageMenuItem} from '@kodality-web/marina-ui';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {filter} from 'rxjs';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {AuthService} from './auth/auth.service';
import {group} from '@kodality-web/core-util';

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
    this.http.get<any[]>("./assets/menu.json").subscribe(menu => {
      const createMenu = (items: any[] = []): MuiPageMenuItem[] => items.map(i => {
        const [route, query] = (i.link?.split('?') || []) as [string, string];
        return ({
          label: i.label?.[this.translateService.currentLang],
          icon: i.icon,
          route: route,
          queryParams: group(query?.split("&") || [], k => k.split('=')[0], k => k.split('=')[1]),
          disabled: i.privileges && !this.authService.hasAnyPrivilege(i.privileges),
          items: createMenu(i.items)
        });
      });
      this.menu = createMenu(menu);
    });
  }


  public onLangChange(lang: string): void {
    this.translateService.use(lang);
    this.loadMenu();
  }
}
