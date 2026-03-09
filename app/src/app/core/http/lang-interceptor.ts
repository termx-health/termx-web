import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';

@Injectable()
export class LangInterceptor implements HttpInterceptor {
  private translateService = inject(TranslateService);


  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.translateService.currentLang) {
      req = req.clone({
        setHeaders: {'Accept-Language': `${this.translateService.currentLang}`}
      });
    }
    return next.handle(req);
  }
}
