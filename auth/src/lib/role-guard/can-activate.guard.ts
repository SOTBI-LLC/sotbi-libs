import { inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type {
  ActivatedRouteSnapshot,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  RouterStateSnapshot,
} from '@angular/router';
import { RedirectCommand, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';
import type { AuthStateModel } from '../store/auth.state';
import { AuthState } from '../store/auth.state';

export const canActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): MaybeAsync<GuardResult> => {
  const title = inject(Title);
  const router = inject(Router);
  const store = inject(Store);

  if (route.data && route.data['title']) {
    title.setTitle(route.data['title']);
  }
  return store.select(AuthState.getUserState).pipe(
    map(({ user, access, home }: AuthStateModel) => {
      // если не авторизован отправляем на странице логина
      if (user.role === 1 || access.size === 0) {
        const loginPath = router.parseUrl('/login');
        return new RedirectCommand(loginPath, {
          skipLocationChange: true,
        });
      }

      // если на роуте есть роль (legacy)
      // tslint:disable-next-line: no-bitwise
      if ((route.data['role'] ?? 0) & user.role) {
        return true;
      }

      // релирект после логина
      if (window.location.pathname === '/login' && state.url === '/') {
        const homePath = router.parseUrl(home);
        return new RedirectCommand(homePath, {
          skipLocationChange: false,
        });
      }

      if (state.url) {
        // авторизованный идет на стартовую страницу
        if (user.role > 1 && state.url === '/') {
          return true;
        }
        // проверчем доступ к конкретной странице
        const nextUrl = state.url.replace(/^\//, '').split('?')[0];
        if (AuthState.hasAccess(nextUrl, access)) {
          return true;
        }
      }

      return false;
    }),
  );
};
