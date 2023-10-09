import {inject} from '@angular/core';
import {CanActivateFn, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AutoLoginAllRoutesGuard} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';
import {AuthService} from 'term-web/core/auth/auth.service';


export const autoLoginGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const autoLoginGuard = inject(AutoLoginAllRoutesGuard) as AutoLoginAllRoutesGuard;
  const authService = inject(AuthService) as AuthService;
  return environment.yupiEnabled || !!authService.user ? of(true) : autoLoginGuard.canActivate(route, state);
};
