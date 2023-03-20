import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TERMINOLOGY_LIB_CONTEXT, TerminologyLibContext} from '../../terminology-lib.config';

@Injectable()
export class YupiHttpInterceptor implements HttpInterceptor {
  public constructor(@Inject(TERMINOLOGY_LIB_CONTEXT) private context: TerminologyLibContext) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.context.yupiEnabled && !this.context.production) {
      req = req.clone({
        setHeaders: {'Authorization': 'Bearer yupi '}
      });
    }

    return next.handle(req);
  }
}
