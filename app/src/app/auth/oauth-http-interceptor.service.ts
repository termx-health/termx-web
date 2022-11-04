import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {mergeMap, Observable} from 'rxjs';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable()
export class OauthHttpInterceptor implements HttpInterceptor {

  public constructor(
    private oidcSecurityService: OidcSecurityService
  ) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.yupiEnabled) {
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
