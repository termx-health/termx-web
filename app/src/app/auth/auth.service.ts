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

    return userPrivileges.some(up => {
      const upParts = up.split(".");
      let cpParts = authPrivilege.split(".");
      if (cpParts.length === 2 && cpParts[0] === '*') { // handle special case like '*.view'
        cpParts = ['*'].concat(cpParts);
      }

      if (upParts.length !== 3 && cpParts.length !== 3) {
        return false;
      }
      return this.match(upParts[0], cpParts[0]) && this.match(upParts[1], cpParts[1]) && this.match(upParts[2], cpParts[2]);
    });
  }

  private match = (upPart: string, apPart: string): boolean => upPart === apPart || upPart === '*';


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
