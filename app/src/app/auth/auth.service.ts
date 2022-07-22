import {Injectable} from '@angular/core';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {map, Observable, tap} from 'rxjs';

interface UserInfo {
  roles: string[]
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private ADMIN = 'admin'; //FIXME: this is wrong, privilege name may change
  public user?: UserInfo;

  public constructor(
    private oidcSecurityService: OidcSecurityService
  ) {
  }


  public refresh(): Observable<UserInfo> {
    return this.refreshUserInfo().pipe(tap(u => this.user = u));
  }

  private refreshUserInfo(): Observable<UserInfo> {
    return this.oidcSecurityService.checkAuth().pipe(map(lr => {
      if (!lr.isAuthenticated) {
        return null as any;
      }
      return {
        roles: lr.userData?.roles || []
      };
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
    return this.includesPrivilege(this.user.roles, this.ADMIN) || this.includesPrivilege(this.user!.roles, privilege);
  }


  public hasAllPrivileges(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return this.includesPrivilege(this.user.roles, this.ADMIN) || privileges.every(p => this.includesPrivilege(this.user!.roles, p));
  }

  public hasAnyPrivilege(privileges: string[]): boolean {
    if (!this.user) {
      return false;
    }
    return this.includesPrivilege(this.user.roles, this.ADMIN) || privileges.some(p => this.includesPrivilege(this.user!.roles, p));
  }
}
