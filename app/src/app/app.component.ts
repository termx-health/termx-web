import {HttpClient} from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Params, Router, RouterLink, RouterOutlet } from '@angular/router';
import { group, ApplyPipe } from '@kodality-web/core-util';
import { MuiPageMenuItem, MarinPageLayoutModule, MuiCoreModule, MuiFormModule } from '@kodality-web/marina-ui';
import {LocalizedName} from '@kodality-web/marina-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {environment} from 'environments/environment';
import {delay, filter, map, pairwise, startWith, switchMap} from 'rxjs';
import {AuthService, HasAnyPrivilegePipe} from 'term-web/core/auth';
import {InfoService} from 'term-web/core/info';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { NoPrivilegeComponent } from 'term-web/core/components/no-privilege';


interface FileMenu {
  label: LocalizedName;
  icon?: string,
  link: string;
  items?: FileMenu[];
  privileges?: string[]
}

const getRouteLastChild = (snap: ActivatedRouteSnapshot): ActivatedRouteSnapshot => snap.firstChild ? getRouteLastChild(snap.firstChild) : snap;


@Component({
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.less'],
    imports: [MarinPageLayoutModule, MuiCoreModule, RouterLink, MuiFormModule, RouterOutlet, NoPrivilegeComponent, AsyncPipe, KeyValuePipe, TranslatePipe, HasAnyPrivilegePipe, ApplyPipe]
})
export class AppComponent {
  protected auth = inject(AuthService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private translateService = inject(TranslateService);

  protected menu$ = this.translateService.onLangChange.pipe(
    startWith({lang: this.translateService.currentLang}),
    switchMap(() => this.http.get<FileMenu[]>("./assets/menu.json")),
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

  public constructor() {
    const auth = this.auth;
    const router = this.router;
    const info = inject(InfoService);

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

    info.version().subscribe(r => {
      this.versions.service = r;
    });
  }


  protected onLangChange(lang: string): void {
    this.translateService.use(lang);
  }

  protected login(): void {
    this.auth.login();
  }

  protected logout(): void {
    this.auth.logout().subscribe();
  }


  private createMenu = (items: (FileMenu | FileMenu[])[] = []): MuiPageMenuItem[] => {
    const parseLink = (link: string): [string, Params] => {
      const [route, query]: string[] = link?.split('?') || [];
      const queryParams = query?.split("&").map(p => p.split('=')) || [];
      const params: Params = group(queryParams, ([k]) => k, ([, v]) => v);
      return [route, params];
    };

    return items.map(fm => {
      const map = (fm: FileMenu): MuiPageMenuItem => {
        const [route, queryParams] = parseLink(fm.link);
        return {
          label: fm.label?.[this.translateService.currentLang],
          icon: fm.icon,
          route: route,
          queryParams: queryParams,
          disabled: fm.privileges && !this.auth.hasAnyPrivilege(fm.privileges),
          items: this.createMenu(fm.items)
        };
      };
      return Array.isArray(fm) ? fm.flatMap(map) : map(fm);
    });
  };
}
