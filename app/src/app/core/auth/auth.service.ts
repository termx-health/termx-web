import {Injectable} from '@angular/core';
import {catchError, map, mergeMap, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';
import Cookies from 'js-cookie';
import {isDefined} from '@kodality-web/core-util';

export interface UserInfo {
  username: string;
  privileges: string[];
}

@Injectable({providedIn: 'root'})
export class AuthService {
  public user?: UserInfo;
  public isAuthenticated = this.oidcSecurityService.isAuthenticated$.pipe(map(r => r.isAuthenticated));

  protected baseUrl = `${environment.termxApi}/auth`;

  public constructor(
    protected http: HttpClient,
    private oidcSecurityService: OidcSecurityService
  ) {
    oidcSecurityService.isAuthenticated$
      .pipe(mergeMap(() => oidcSecurityService.getAuthenticationResult()))
      .subscribe(ar => {
        if (isDefined(ar)) {
          Cookies.set('oauth-token', ar['access_token'], {
            expires: new Date(new Date().getTime() + ar['expires_in'] * 1000),
            secure: environment.production
          });
        } else {
          Cookies.remove('oauth-token');
        }
      });
  }


  public refresh(): Observable<UserInfo> {
    if (environment.yupiEnabled) {
      return of({username: 'yupi', privileges: ['*.*.*']}).pipe(tap(u => this.user = u));
    }
    return this.refreshUserInfo().pipe(tap(u => this.user = u));
  }


  private refreshUserInfo(): Observable<UserInfo> {
    return this.oidcSecurityService.checkAuth().pipe(mergeMap(lr => {
      return this.http.get<UserInfo>(`${this.baseUrl}/userinfo`).pipe(catchError(() => {
        this.oidcSecurityService.authorize();
        return of(null as UserInfo);
      }));
    }));
  }

  public login(): void {
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
    return this.includesPrivilege(this.user!.privileges, privilege);
  }

  public hasAllPrivileges(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return privileges.every(p => this.includesPrivilege(this.user!.privileges, p));
  }

  public hasAnyPrivilege(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return privileges.some(p => this.includesPrivilege(this.user!.privileges, p));
  }
}
