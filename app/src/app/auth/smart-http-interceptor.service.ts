import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {SmartAuthService} from './smart-auth.service';

@Injectable()
export class SmartHttpInterceptor implements HttpInterceptor {

  public constructor(
    private smartAuthService: SmartAuthService
  ) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.yupiEnabled) {
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
