import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';

@Injectable()
export class YupiHttpInterceptor implements HttpInterceptor {

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.yupiEnabled && !environment.production) {
      req = req.clone({
        setHeaders: {'Authorization': 'Bearer yupi '}
      });
    }

    return next.handle(req);
  }
}
