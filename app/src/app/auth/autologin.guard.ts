import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, RouterStateSnapshot, UrlTree} from '@angular/router';
import {mergeMap, Observable, of} from 'rxjs';
import {SmartAuthService} from './smart-auth.service';
import {AutoLoginAllRoutesGuard} from 'angular-auth-oidc-client';
import {environment} from '../../environments/environment';


@Injectable({providedIn: 'root'})
export class AutoLoginGuard implements CanActivate, CanActivateChild, CanLoad {
  public constructor(
    private autoLoginGuard: AutoLoginAllRoutesGuard,
    private smartAuthService: SmartAuthService
  ) {}

  public canLoad(): Observable<boolean | UrlTree> {
    return environment.yupiEnabled ? of(true) : this.smartAuthService.checkAuth().pipe(mergeMap(authenticated => {
      return authenticated ? of(authenticated) : this.autoLoginGuard.canLoad();
    }));
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return environment.yupiEnabled ? of(true) : this.smartAuthService.checkAuth().pipe(mergeMap(authenticated => {
      return authenticated ? of(authenticated) : this.autoLoginGuard.canActivate(route, state);
    }));
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return environment.yupiEnabled ? of(true) : this.smartAuthService.checkAuth().pipe(mergeMap(authenticated => {
      return authenticated ? of(authenticated) : this.autoLoginGuard.canActivateChild(route, state);
    }));
  }

}
