import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { RedirectCommand, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';
import type { AuthStateModel } from '../store/auth.state';
import { AuthState } from '../store/auth.state';

export const canMatchGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const store = inject(Store);
  return store.select(AuthState.getUserState).pipe(
    map(({ user, access, home }: AuthStateModel) => {
      if (user.role === 1 || access.size === 0) {
        const loginPath = router.parseUrl('/login');
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

      const loginPath = router.parseUrl(home);
      return new RedirectCommand(loginPath, {
        skipLocationChange: true,
      });
    }),
  );

  return true;
};
