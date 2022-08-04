import {Inject, Injectable} from '@angular/core';
import {mergeMap, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TERMINOLOGY_API} from 'terminology-lib/terminology-lib.token';
import {OidcSecurityService} from 'angular-auth-oidc-client';

interface UserInfo {
  username: string;
  privileges: string[];
}

@Injectable({providedIn: 'root'})
export class AuthService {

  private ADMIN = 'admin';
  public user?: UserInfo;

  protected baseUrl;

  public constructor(
    @Inject(TERMINOLOGY_API) api: string,
    protected http: HttpClient,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.baseUrl = `${api}/auth`;
  }


  public refresh(): Observable<UserInfo> {
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


  private includesPrivilege(privileges: string[], privilege: string): boolean {
    if (!privilege) {
      return false;
    }
    if (!privileges) {
      return false;
    }

    if (privilege.indexOf('*') === privilege.length - 1) {
      return privileges.some(p => p.startsWith(privilege.substring(0, privilege.length - 1)));
    }
    if (privilege.indexOf('*') === 0) {
      return privileges.some(p => p.endsWith(privilege.substring(1, privilege.length)));
    }
    return privileges.includes(privilege);
  }

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
