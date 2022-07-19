import {Injectable} from '@angular/core';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {map, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {

  public constructor(
    private oidcSecurityService: OidcSecurityService
  ) {
  }

  public getUserPrivileges(): Observable<string[]> {
    return this.oidcSecurityService.checkAuth().pipe(map(lr => {
      return lr.userData?.roles || [];
    }));
  }

  public hasPrivilege(privilege: string): Observable<boolean> {
    return this.getUserPrivileges().pipe(map(privileges => {
      return privileges.indexOf(privilege) !== -1;
    }));
  }
  public hasAnyPrivilege(privileges: string[]): Observable<boolean> {
    return this.getUserPrivileges().pipe(map(userPrivileges => {
      return privileges.some(k => userPrivileges.indexOf(k) !== -1);
    }));
  }
}
