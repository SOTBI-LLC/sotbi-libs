import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanMatch,
  GuardResult,
  MaybeAsync,
  Route,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
import { RedirectCommand, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';
import type { AuthStateModel } from '../store/auth.state';
import { AuthState } from '../store/auth.state';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate, CanActivateChild, CanMatch {
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): MaybeAsync<GuardResult> {
    if (route.data && route.data['title']) {
      this.title.setTitle(route.data['title']);
    }
    return this.store.select(AuthState.getUserState).pipe(
      map(({ user, access, home }: AuthStateModel) => {
        if (user.role === 1 || access.size === 0) {
          const loginPath = this.router.parseUrl('/login');
          return new RedirectCommand(loginPath, {
            skipLocationChange: true,
          });
        }
        // tslint:disable-next-line: no-bitwise
        if (
          route.data &&
          route.data['role'] &&
          !!(route.data['role'] & user.role)
        ) {
          return true;
        }
        const nextUrl = state.url.replace(/^\//, '').split('?')[0];
        if (AuthState.hasAccess(nextUrl, access)) {
          return true;
        }
        if (window.location.pathname === '/') {
          const homePath = this.router.parseUrl(home);
          return new RedirectCommand(homePath, {
            skipLocationChange: true,
          });
        }
        return false;
      }),
    );
  }
  public canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): MaybeAsync<GuardResult> {
    return this.canActivate(childRoute, state);
  }
  public canMatch(
    route: Route,
    segments: UrlSegment[],
  ): MaybeAsync<GuardResult> {
    return this.store.select(AuthState.getUserState).pipe(
      map(({ user, access, home }: AuthStateModel) => {
        if (user.role === 1 || access.size === 0) {
          const loginPath = this.router.parseUrl('/login');
          return new RedirectCommand(loginPath, {
            skipLocationChange: true,
          });
        }

        // tslint:disable-next-line: no-bitwise
        if (
          route.data &&
          route.data['role'] &&
          !!(route.data['role'] & user.role)
        ) {
          return true;
        }

        const path = segments
          .reduce((p, el) => {
            return (p += '/' + el.path);
          }, '')
          .replace(/^\//, '');
        if (AuthState.hasAccess(path, access)) {
          return true;
        }

        const loginPath = this.router.parseUrl(home);
        return new RedirectCommand(loginPath, {
          skipLocationChange: true,
        });
      }),
    );
  }
}
