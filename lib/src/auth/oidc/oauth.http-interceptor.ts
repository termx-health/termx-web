import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {mergeMap, Observable} from 'rxjs';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_LIB_CONTEXT, TerminologyLibContext} from '../../terminology-lib.config';

@Injectable()
export class OauthHttpInterceptor implements HttpInterceptor {
  public constructor(
    private oidcSecurityService: OidcSecurityService,
    @Inject(TERMINOLOGY_LIB_CONTEXT) private context: TerminologyLibContext,
  ) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.context.yupiEnabled) {
      return next.handle(req);
    }

    return this.oidcSecurityService.getAccessToken().pipe(mergeMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      return next.handle(req);
    }));
  }

}
