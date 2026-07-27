import {HttpClient} from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Params, Router, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { group, ApplyPipe } from '@termx-health/core-util';
import { MuiPageMenuItem, MarinPageLayoutModule, MuiCoreModule, MuiFormModule } from '@termx-health/ui';
import {LocalizedName} from '@termx-health/util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {environment} from 'environments/environment';
import {delay, distinctUntilChanged, filter, map, pairwise, startWith, switchMap} from 'rxjs';
import {AuthService, HasAnyPrivilegePipe} from 'term-web/core/auth';
import {InfoService} from 'term-web/core/info';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {SkinService} from 'term-web/core/skin/skin.service';
import {ShortcutService} from 'term-web/core/shortcuts/shortcut.service';
import {ShortcutHelpComponent} from 'term-web/core/shortcuts/shortcut-help.component';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NoPrivilegeComponent } from 'term-web/core/components/no-privilege';


interface FileMenu {
  label: LocalizedName;
  icon?: string,
  link: string;
  items?: FileMenu[];
  privileges?: string[]
}

const getRouteLastChild = (snap: ActivatedRouteSnapshot): ActivatedRouteSnapshot => snap.firstChild ? getRouteLastChild(snap.firstChild) : snap;

/**
 * Every concrete path the router config can match, as slash-joined strings (no leading slash),
 * e.g. `resources`, `resources/code-systems`. Used to disable menu entries that point at a route
 * this build doesn't have — so a deployment can serve a shared menu listing routes it omits.
 * Pathless and empty-path routes pass their prefix through (they group children, add no segment);
 * `**`/param routes are collected verbatim and simply never equal a real menu link.
 */
const collectRoutePaths = (routes: Routes = [], prefix = ''): string[] =>
  routes.flatMap(r => {
    const full = r.path ? [prefix, r.path].filter(Boolean).join('/') : prefix;
    return [full, ...collectRoutePaths(r.children, full)];
  });


@Component({
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.less'],
    imports: [MarinPageLayoutModule, MuiCoreModule, RouterLink, MuiFormModule, RouterOutlet, NoPrivilegeComponent, AsyncPipe, KeyValuePipe, TranslatePipe, HasAnyPrivilegePipe, ApplyPipe, FormsModule, NzRadioModule, ShortcutHelpComponent]
})
export class AppComponent {
  protected auth = inject(AuthService);
  protected preferences = inject(PreferencesService);

  /** Appearance preset shown in the Accessibility modal: White (main skin), Dark (dark theme), NCEZ (cs-gov skin). */
  protected get appearance(): 'white' | 'dark' | 'ncez' {
    if (this.preferences.theme === 'dark') {
      return 'dark';
    }
    return this.skinService.skinId === 'cs-gov' ? 'ncez' : 'white';
  }

  protected setAppearance(value: 'white' | 'dark' | 'ncez'): void {
    if (value === 'dark') {
      this.skinService.setSkin('main');
      this.preferences.setTheme('dark');
    } else {
      this.preferences.setTheme('light');
      this.skinService.setSkin(value === 'ncez' ? 'cs-gov' : 'main');
    }
  }
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private translateService = inject(TranslateService);
  protected skinService = inject(SkinService);
  private shortcutService = inject(ShortcutService);

  // Concrete route paths this build has, for menu route-gating (see collectRoutePaths / createMenu).
  private readonly availableRoutePaths = new Set(collectRoutePaths(this.router.config));
  protected menu$ = this.translateService.onLangChange.pipe(
    startWith({lang: this.translateService.currentLang}),
    switchMap(() => this.http.get<FileMenu[]>(environment.menuUrl || './assets/menu.json')),
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
    }),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );
  protected isEmbedded = (url: string): boolean => url?.startsWith('/embedded');
  protected readonly semiEmbedded = !!environment.embedded;
  // Host app supplies its own chrome → hide TermX's header, keep normal routing. See Environment.externalChrome.
  protected readonly externalChrome = !!environment.externalChrome;
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

    // Global "?" (Shift+/) opens the keyboard-shortcut help modal.
    this.shortcutService.registerShortcut('global', 'Shift+Slash', () => this.shortcutService.triggerHelp(), 'help');
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
        const missingRoute = !!route && !this.availableRoutePaths.has(route.replace(/^\//, ''));
        return {
          label: fm.label?.[this.translateService.currentLang],
          icon: fm.icon,
          route: route,
          queryParams: queryParams,
          // Disable when the target route isn't in this build, or the user lacks the privilege.
          disabled: missingRoute || (fm.privileges && !this.auth.hasAnyPrivilege(fm.privileges)),
          items: this.createMenu(fm.items)
        };
      };
      return Array.isArray(fm) ? fm.flatMap(map) : map(fm);
    });
  };
}
