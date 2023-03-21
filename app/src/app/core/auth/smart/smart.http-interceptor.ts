/*
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_LIB_CONTEXT, TerminologyLibContext} from '@terminology/core';

@Injectable()
export class SmartHttpInterceptor implements HttpInterceptor {
  public constructor(
    private smartAuthService: SmartAuthService,
    @Inject(TERMINOLOGY_LIB_CONTEXT) private context: TerminologyLibContext,
  ) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.context.yupiEnabled) {
      return next.handle(req);
    }

    if (!this.smartAuthService.getAuthToken()) {
      return next.handle(req);
    }

    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${this.smartAuthService.getAuthToken()}`,
        'X-Smart-Iss': `${this.smartAuthService.getSmartState()?.iss.iss}`
      }
    });
    return next.handle(req);
  }
}
*/
