import {inject} from '@angular/core';
import {CanActivateFn, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AutoLoginAllRoutesGuard} from 'angular-auth-oidc-client';
import {TERMINOLOGY_LIB_CONTEXT, TerminologyLibContext} from '../terminology-lib.config';


export const autoLoginGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const context = inject(TERMINOLOGY_LIB_CONTEXT) as TerminologyLibContext;
  const autoLoginGuard = inject(AutoLoginAllRoutesGuard) as AutoLoginAllRoutesGuard;
  return context.yupiEnabled ? of(true) : autoLoginGuard.canActivate(route, state);
};
