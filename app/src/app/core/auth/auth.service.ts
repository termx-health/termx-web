import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {isDefined, isNil} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {EventTypes, OidcSecurityService, PublicEventsService} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';
import Cookies from 'js-cookie';
import {catchError, filter, map, mergeMap, Observable, of, switchMap, tap} from 'rxjs';

const COOKIE_OAUTH_TOKEN_KEY = 'termx-oauth-token';
const REDIRECT_ORIGIN_URL = '__termx-redirect_origin_url';

export interface UserInfo {
  username: string;
  privileges: string[];
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly baseUrl = `${environment.termxApi}/auth`;

  public user?: UserInfo;
  public isAuthenticated = this.oidcSecurityService.isAuthenticated$.pipe(map(r => r.isAuthenticated));
  public notificationShown?: boolean = false;

  public get token(): Observable<string> {
    return this.oidcSecurityService.getAccessToken();
  }

  public constructor(
    protected http: HttpClient,
    protected router: Router,
    private oidcSecurityService: OidcSecurityService,
    private notificationService: MuiNotificationService,
    eventService: PublicEventsService,
  ) {
    eventService.registerForEvents().subscribe(e => console.log(e));

    this.updateAuthTokenCookie(oidcSecurityService);
    this.processAuthFinishEvents(eventService);
    this.processNewAuthenticationEvents(eventService);
    this.processUserDataChangeEvents(eventService);
  }

  public refresh(): Observable<UserInfo> {
    if (environment.yupiEnabled) {
      return of({username: 'yupi', privileges: ['*.*.*']}).pipe(tap(u => this.user = u));
    }

    return this.refreshUserInfo().pipe(
      tap(resp => {
        this.user = resp;
      }),
      catchError(() => {
        this.user = undefined;
        this.login();
        return of();
      })
    );
  }

  private refreshUserInfo(): Observable<UserInfo> {
    return this.oidcSecurityService.checkAuth().pipe(
      mergeMap(lr => {
        if (lr.isAuthenticated || !lr.accessToken) {
          // 1. user is authenticated -> load valid userinfo
          // 2. no token -> load guest userinfo
          return this.loadUserInfo();
        }

        //  trigger session refresh when user is not authenticated and access token exists
        return this.forceRefreshSession();
      })
    );
  }

  private forceRefreshSession(): Observable<UserInfo> {
    return this.oidcSecurityService.forceRefreshSession().pipe(
      // angular-auth-oidc-client "feature":
      //  Silent renew is not started when 'forceRefreshSession' is called.
      //  In order to start it again, the 'checkAuth' must be triggered.
      //  p.s: 'checkAuth' starts silent refresh only when user is authenticated.
      mergeMap(() => this.oidcSecurityService.checkAuth()),
      mergeMap(() => this.loadUserInfo())
    );
  }

  private loadUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.baseUrl}/userinfo`);
  }


  public login(): void {
    sessionStorage.setItem(REDIRECT_ORIGIN_URL, window.location.pathname + window.location.search);
    this.oidcSecurityService.authorize();
  }

  public logout(): Observable<unknown> {
    return this.oidcSecurityService.logoff();
  }


  private includesPrivilege(userPrivileges: string[], authPrivilege: string): boolean {
    if (!authPrivilege) {
      return false;
    }
    if (!userPrivileges) {
      return false;
    }

    return userPrivileges.some(userPrivilege => {
      let upParts = /(.*)\.([^\.]+)\.([^.]+)$/.exec(userPrivilege).splice(1, 3);  //userPrivilege.split('.');
      let apParts = /(.*)\.([^\.]+)\.([^.]+)$/.exec(authPrivilege).splice(1, 3);  //authPrivilege.split('.');
      if (apParts.length === 2 && apParts[0] === '*') { // handle special case like '*.view'
        apParts = ['*'].concat(apParts);
      }
      if (upParts.length === 2 && upParts[0] === '*') { // handle special case like '*.view'
        upParts = ['*'].concat(upParts);
      }

      if (upParts.length !== 3 && apParts.length !== 3) {
        return false;
      }
      return this.match(upParts[0], apParts[0]) && this.match(upParts[1], apParts[1]) && this.match(upParts[2], apParts[2]);
    });
  }

  private match = (upPart: string, apPart: string): boolean => upPart === apPart || upPart === '*' || apPart === '*';


  public hasPrivilege(privilege: string): boolean {
    if (!this.user) {
      return false;
    }
    return this.includesPrivilege(this.user.privileges, privilege);
  }

  public hasAllPrivileges(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return privileges.every(p => this.includesPrivilege(this.user.privileges, p));
  }

  public hasAnyPrivilege(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return privileges.some(p => this.includesPrivilege(this.user.privileges, p));
  }

  private updateAuthTokenCookie(oidcSecurityService: OidcSecurityService): void {
    oidcSecurityService.isAuthenticated$
      .pipe(mergeMap(() => oidcSecurityService.getAuthenticationResult()))
      .subscribe(ar => {
        if (isDefined(ar)) {
          Cookies.set(COOKIE_OAUTH_TOKEN_KEY, ar['access_token'], {
            expires: new Date(new Date().getTime() + ar['expires_in'] * 1000),
            secure: environment.production
          });
        } else {
          Cookies.remove(COOKIE_OAUTH_TOKEN_KEY);
        }
      });
  }

  private processAuthFinishEvents(eventService: PublicEventsService): void {
    eventService.registerForEvents()
      .pipe(
        filter(e => e.type === EventTypes.CheckingAuthFinished),
        switchMap(() => this.isAuthenticated),
        filter(isAuthenticated => isAuthenticated),
        tap(() => {
          const redirectOriginUrl = sessionStorage.getItem(REDIRECT_ORIGIN_URL);
          if (redirectOriginUrl) {
            sessionStorage.removeItem(REDIRECT_ORIGIN_URL);
            window.location.replace(redirectOriginUrl);
          }
        })
      )
      .subscribe();
  }

  private processNewAuthenticationEvents(eventService: PublicEventsService): void {
    eventService.registerForEvents()
      .pipe(filter(e => e.type === EventTypes.NewAuthenticationResult))
      .subscribe(() => {
        this.oidcSecurityService.getAuthenticationResult().subscribe(r => {
          if ((r['expires_in'] < 300 || r['refresh_expires_in'] < 300) && !this.notificationShown) {
            this.notificationShown = true;
            this.notificationService.warning('core.session-expiration-warning' , null, {duration: 0, closable: true});
          }
        });
      });
  }

  private processUserDataChangeEvents(eventService: PublicEventsService): void {
    eventService.registerForEvents().pipe(filter(e => e.type === EventTypes.UserDataChanged))
      .subscribe(e => {
        if (isNil(e.value?.['userData'])) {
          this.notificationService.error('core.session-expiration-error' , null, {duration: 0, closable: true});
        }
      });
  }
}
