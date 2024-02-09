import {Component, OnInit} from '@angular/core';
import {MuiPageMenuItem} from '@kodality-web/marina-ui';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {delay, filter, map, pairwise, startWith, switchMap} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {group} from '@kodality-web/core-util';
import {environment} from 'environments/environment';

const getRouteLastChild = (snap: ActivatedRouteSnapshot): ActivatedRouteSnapshot => snap.firstChild ? getRouteLastChild(snap.firstChild) : snap;

@Component({
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.less']
})
export class AppComponent implements OnInit {
  protected menu$ = this.translateService.onLangChange.pipe(
    startWith({lang: this.translateService.currentLang}),
    switchMap(() => this.http.get<any[]>("./assets/menu.json")),
    map(resp => this.createMenu(resp))
  );
  protected activeRoutePrivileges$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const route = getRouteLastChild(this.route.snapshot);
      return route?.data?.['privilege']?.map(p => {
        return p.replace(/{(\w+)}/g, (x, match) => route.params[match] || x);
      }) ?? [];
    })
  );
  protected isEmbedded = (url: string): boolean => url?.startsWith('/embedded');
  protected versions = {
    web: environment.appVersion,
    service: ''
  };

  public constructor(
    protected auth: AuthService,
    protected router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private translateService: TranslateService,
  ) {
    router.events.pipe(
      filter(e => e instanceof NavigationStart),
      startWith({url: this.router.url}),
      pairwise()
    ).subscribe(([from, to]: [NavigationStart, NavigationStart]) => {
      const fromEmbedded = from?.url?.startsWith('/embedded');
      const toEmbedded = to.url.startsWith('/embedded');
      if (fromEmbedded && !toEmbedded) {
        this.router.navigateByUrl('/embedded' + to.url);
      }
    });

    auth.isAuthenticated.pipe(delay(50)).subscribe(() => {
      const el = document.getElementById('preloader');
      el?.classList.add('hide');
      setTimeout(() => el?.remove(), 150);
    });
  }

  public ngOnInit(): void {
    this.http.get(`${environment.termxApi}/info`).subscribe(r => this.versions.service = r['version']);
  }

  protected login(): void {
    this.auth.login();
  }

  protected logout(): void {
    this.auth.logout().subscribe();
  }

  protected onLangChange(lang: string): void {
    this.translateService.use(lang);
  }


  private createMenu = (items: any[] = []): MuiPageMenuItem[] => items.map(i => {
    const [route, query] = (i.link?.split('?') || []) as [string, string];
    return {
      label: i.label?.[this.translateService.currentLang],
      icon: i.icon,
      route: route,
      queryParams: group(query?.split("&") || [], k => k.split('=')[0], k => k.split('=')[1]),
      disabled: i.privileges && !this.auth.hasAnyPrivilege(i.privileges),
      items: this.createMenu(i.items)
    };
  });
}
