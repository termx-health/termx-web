import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {MuiNotificationService} from '@kodality-health/marina-ui';
import {catchError, Observable, throwError} from 'rxjs';

@Injectable()
export class ErrorHandler implements HttpInterceptor {
  // todo: move to MarinaUI
  public constructor(private notificationService: MuiNotificationService) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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

  private isErrorStatus(error: HttpErrorResponse): boolean {
    return error.status >= 400 && error.status < 600 || error.status === 0;
  }

  private showMessage(error: HttpErrorResponse): void {
    // todo: handle ApiError etc
    this.showError('System error', error.message);
  }

  private showError(summary: string, message: string): void {
    this.notificationService.error(summary, message, {duration: 10_000});
  }
}
