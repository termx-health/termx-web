import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class LangInterceptor implements HttpInterceptor {

  public constructor(private translateService: TranslateService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.translateService.currentLang) {
      req = req.clone({
        setHeaders: {'Accept-Language': `${this.translateService.currentLang}`}
      });
    }
    return next.handle(req);
  }
}
