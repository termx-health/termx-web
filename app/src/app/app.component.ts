import {Component, OnInit} from '@angular/core';
import {MuiPageMenuItem} from '@kodality-web/marina-ui';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {filter} from 'rxjs';
import {AuthService, UserInfo} from 'term-web/core/auth';
import {group} from '@kodality-web/core-util';

@Component({
  selector: 'tw-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.less']
})
export class AppComponent implements OnInit {
  public menu: MuiPageMenuItem[] = [];
  public activeRoutePrivileges?: string[];
  public pageType?: string;

  public constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    protected auth: AuthService
  ) {}

  public ngOnInit(): void {
    this.loadMenu();

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const getLastChild = (r): ActivatedRouteSnapshot => r.firstChild ? getLastChild(r.firstChild) : r;
      const lastChild = getLastChild(this.route.snapshot);

      this.activeRoutePrivileges = lastChild.data['privilege'];
      this.pageType = lastChild.data['pageType'];
    });
  }

  public logout(): void {
    this.auth.logout().subscribe();
  }

  private loadMenu(): void {
    const createMenu = (items: any[] = []): MuiPageMenuItem[] => items.map(i => {
      const [route, query] = (i.link?.split('?') || []) as [string, string];
      return {
        label: i.label?.[this.translateService.currentLang],
        icon: i.icon,
        route: route,
        queryParams: group(query?.split("&") || [], k => k.split('=')[0], k => k.split('=')[1]),
        disabled: i.privileges && !this.auth.hasAnyPrivilege(i.privileges),
        items: createMenu(i.items)
      };
    });

    this.http.get<any[]>("./assets/menu.json").subscribe(menu => this.menu = createMenu(menu));
  }


  public onLangChange(lang: string): void {
    this.translateService.use(lang);
    this.loadMenu();
  }
}
