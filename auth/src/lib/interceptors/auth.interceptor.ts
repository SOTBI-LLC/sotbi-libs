import { Location } from '@angular/common';
import type {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import type { Observable } from 'rxjs';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AUTH_NOTIFICATION } from '../auth-notification.ervice';
import { RefreshToken } from '../store/auth.actions';
import { AuthState } from '../store/auth.state';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  protected router = inject(Router);
  private readonly store = inject(Store);
  private readonly location = inject(Location);
  private readonly notification = inject(AUTH_NOTIFICATION, { optional: true });

  private token = this.store.selectSignal(AuthState.getToken);

  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);
  private isRefreshingToken = false;

  public addToken<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
    return req.clone({
      headers: req.headers.set('Authorization', token),
    });
  }

  public handle401Error<T>(
    req: HttpRequest<T>,
    next: HttpHandler,
    error: Error,
  ): Observable<HttpEvent<T>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.tokenSubject.next(null);
      const refresh = localStorage.getItem('refreshUser');
      const refreshToken =
        this.store.selectSnapshot(AuthState.getRefreshToken) ?? refresh;
      if (!refreshToken) {
        return throwError(() => error);
      }
      return this.store.dispatch(new RefreshToken(refreshToken)).pipe(
        switchMap(() => {
          const token = this.token();
          this.tokenSubject.next(token);
          return next.handle(this.addToken(req, `Bearer ${token}`));
        }),
        catchError((err) => {
          this.logoutUser(err).then();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        }),
      );
    } else {
      return this.tokenSubject.asObservable().pipe(
        filter((token) => Boolean(token)),
        take(1),
        switchMap((token) =>
          next.handle(this.addToken(req, `Bearer ${token}`)),
        ),
      );
    }
  }

  public intercept<T>(
    request: HttpRequest<T>,
    next: HttpHandler,
  ): Observable<HttpEvent<T>> {
    // Get the auth header from the service.
    const authHeader =
      'Bearer ' + this.store.selectSnapshot(AuthState.getToken);
    // Clone the request to add the new header.
    request = this.addToken(request, authHeader);
    // Pass on the cloned request instead of the original request.
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        switch (err.status) {
          case 401:
            return this.handle401Error(request, next, err);
          case 403:
            this.notification?.showError('У ВАС НЕДОСТАТОЧНО ПРАВ!');
            this.location.back();
            return throwError(() => err);
        }
        return throwError(() => err);
      }),
    );
  }

  private logoutUser(url: string): Promise<boolean> {
    return this.router.navigate(['/login'], {
      queryParams: { returnUrl: url },
    });
  }
}
