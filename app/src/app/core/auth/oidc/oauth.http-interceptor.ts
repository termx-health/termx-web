import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';
import {mergeMap, Observable} from 'rxjs';

const OIDC_DISCOVERY_PATH = '/.well-known/openid-configuration';

@Injectable()
export class OauthHttpInterceptor implements HttpInterceptor {
  private oidcSecurityService = inject(OidcSecurityService);


  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.yupiEnabled || this.isOidcDiscoveryRequest(req.url)) {
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

  private isOidcDiscoveryRequest(url: string): boolean {
    try {
      return new URL(url, window.location.origin).pathname.endsWith(OIDC_DISCOVERY_PATH);
    } catch {
      return url.includes(OIDC_DISCOVERY_PATH);
    }
  }

}
