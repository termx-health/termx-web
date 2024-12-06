import {Injectable, TemplateRef} from '@angular/core';
import {HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {
  MuiNotificationEntityOptions,
  MuiNotificationService,
  MuiConfigService,
  MuiHttpErrorHandlerConfig, DEFAULT_HTTP_ERROR_HANDLER_CONFIG
} from '@kodality-web/marina-ui';
import {catchError, Observable, throwError} from 'rxjs';
import {CoreI18nService} from '@kodality-web/core-util';

export const MuiSkipErrorHandler = new HttpContextToken<boolean>(() => false);

interface Issue {
  severity: string;
  code: string;
  message: string;
  params: Record<string, any>
}

type ShowErrorFun = (title: string | TemplateRef<any>, content?: string | TemplateRef<any>, options?: MuiNotificationEntityOptions) => void;


@Injectable({providedIn: 'root'})
export class HttpErrorNotificationService {
  private hook: ShowErrorFun;

  public constructor(
    private notificationService: MuiNotificationService,
  ) { }

  public registerHook(clb: ShowErrorFun): () => void {
    this.hook = clb;
    return () => this.hook = null;
  }

  public showError(title: string, message: string, options?: MuiNotificationEntityOptions): void {
    if (this.hook) {
      this.hook(title, message, options);
    } else {
      this.notificationService.error(title, message, options);
    }
  }
}

@Injectable()
export class HttpErrorHandler implements HttpInterceptor {
  public constructor(
    private httpNotificationService: HttpErrorNotificationService,
    private configService: MuiConfigService,
    private i18nService: CoreI18nService
  ) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.context.get(MuiSkipErrorHandler)?.valueOf()) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<HttpEvent<any>> {
    if (this.isErrorStatus(error)) {
      this.showMessage(error);
      return throwError(() => error);
    }
    return throwError(() => error);
  }


  private showMessage(error: HttpErrorResponse): void {
    if (Array.isArray(error.error)) {
      error.error.forEach((e: Issue) => {
        const translationKey = e.code ? `${this.config.translationPrefix}${e.code}` : undefined;
        const localMessage = e.code ? this.i18nService.instant(translationKey, e.params) : undefined;
        this.showError(e.code, localMessage !== translationKey ? localMessage : e.message, e.params?.['details']);
      });
    } else {
      switch (error.status) {
        case 403:
          this.showError(this.i18nService.instant('core.error.403.title'), this.i18nService.instant('core.error.403.message'));
          break;
        default:
          this.showError(this.i18nService.instant('marina.ui.http.systemError'), error.message);
          break;
      }
    }
  }

  private showError(title: string, message: string, details?: string): void {
    const {duration, placement} = this.config;
    this.httpNotificationService.showError(title, message, {duration, placement, data: {details}});
  }

  private isErrorStatus(error: HttpErrorResponse): boolean {
    return error.status >= 400 && error.status < 600 || error.status === 0;
  }

  private get config(): MuiHttpErrorHandlerConfig {
    return {
      ...DEFAULT_HTTP_ERROR_HANDLER_CONFIG,
      ...this.configService.getConfigFor('httpErrorHandler')
    };
  }
}
