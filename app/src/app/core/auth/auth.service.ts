import {Injectable} from '@angular/core';
import {mergeMap, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';

export interface UserInfo {
  username: string;
  privileges: string[];
}

@Injectable({providedIn: 'root'})
export class AuthService {

  private ADMIN = 'admin';
  public user?: UserInfo;

  protected baseUrl = `${environment.termxApi}/auth`;

  public constructor(
    protected http: HttpClient,
    private oidcSecurityService: OidcSecurityService,
  ) { }


  public refresh(): Observable<UserInfo> {
    if (environment.yupiEnabled) {
      return of({username: 'yupi', privileges: [this.ADMIN]}).pipe(tap(u => this.user = u));
    }
    return this.refreshUserInfo().pipe(tap(u => this.user = u));
  }


  private refreshUserInfo(): Observable<UserInfo> {
    return this.oidcSecurityService.checkAuth().pipe(mergeMap(lr => {
      if (!lr.isAuthenticated) {
        return of(null as any);
      } else {
        return this.http.get<UserInfo>(`${this.baseUrl}/userinfo`);
      }
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

    if (authPrivilege === this.ADMIN) {
      return userPrivileges.includes(this.ADMIN);
    }

    return userPrivileges.some(userPrivilege => {
      if (authPrivilege === this.ADMIN) {
        return userPrivilege === this.ADMIN;
      }
      let upParts = userPrivilege.split('.');
      let apParts = authPrivilege.split('.');
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
    return this.includesPrivilege(this.user.privileges, this.ADMIN) || this.includesPrivilege(this.user!.privileges, privilege);
  }

  public hasAllPrivileges(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return this.includesPrivilege(this.user.privileges, this.ADMIN) || privileges.every(p => this.includesPrivilege(this.user!.privileges, p));
  }

  public hasAnyPrivilege(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return this.includesPrivilege(this.user.privileges, this.ADMIN) || privileges.some(p => this.includesPrivilege(this.user!.privileges, p));
  }
}
