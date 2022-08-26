import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable()
export class YupiHttpInterceptor implements HttpInterceptor {

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.production && environment.yupiEnabled) {
      req = req.clone({
        setHeaders: {'Authorization': 'Bearer yupi '}
      });
    }
    return next.handle(req);
  }
}
