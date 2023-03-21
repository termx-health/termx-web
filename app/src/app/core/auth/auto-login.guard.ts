import {inject} from '@angular/core';
import {CanActivateFn, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AutoLoginAllRoutesGuard} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';


export const autoLoginGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const autoLoginGuard = inject(AutoLoginAllRoutesGuard) as AutoLoginAllRoutesGuard;
  return environment.yupiEnabled ? of(true) : autoLoginGuard.canActivate(route, state);
};
