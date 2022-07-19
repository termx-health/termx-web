import {Injectable} from '@angular/core';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {map, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {

  private ADMIN = 'admin'; //FIXME: this is wrong, privilege name may change

  public constructor(
    private oidcSecurityService: OidcSecurityService
  ) {
  }

  public getUserPrivileges(): Observable<string[]> {
    return this.oidcSecurityService.checkAuth().pipe(map(lr => {
      return lr.userData?.roles || [];
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

  public hasPrivilege(privilege: string): Observable<boolean> {
    return this.getUserPrivileges().pipe(map(privileges => {
      return this.includesPrivilege(privileges, this.ADMIN) || this.includesPrivilege(privileges, privilege);
    }));
  }

  public hasAllPrivileges(privileges: string[]): Observable<boolean> {
    return this.getUserPrivileges().pipe(map(userPrivileges => {
      return this.includesPrivilege(userPrivileges, this.ADMIN) || privileges.every(p => this.includesPrivilege(userPrivileges, p));
    }));
  }

  public hasAnyPrivilege(privileges: string[]): Observable<boolean> {
    return this.getUserPrivileges().pipe(map(userPrivileges => {
      return this.includesPrivilege(userPrivileges, this.ADMIN) || privileges.some(p => this.includesPrivilege(userPrivileges, p));
    }));
  }
}
