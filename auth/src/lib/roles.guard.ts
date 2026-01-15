import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import type {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanMatch,
  Route,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import type { Observable } from 'rxjs';
import { AuthState } from './store/auth.state';

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivate, CanActivateChild, CanMatch {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly title = inject(Title);
  private readonly snackBar = inject(MatSnackBar);

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const nextUrl = state.url.replace(/^\//, '').split('?')[0];
    const { user, access, home } = this.store.selectSnapshot(
      AuthState.getUserState
    );
    // console.log('canActivate', nextUrl, user, access);
    if (next.data && next.data['title']) {
      this.title.setTitle(next.data['title']);
    }
    // tslint:disable-next-line: no-bitwise
    if (
      next.data &&
      next.data['role'] &&
      !!(next.data['role'] & (user.role ??= 0))
    ) {
      // console.log('canActivate next.data.role TRUE', nextUrl, user);
      return true;
    }
    if (AuthState.hasAccess(nextUrl, access)) {
      // console.log('canActivate hasAccess TRUE', nextUrl, user);
      return true;
    }
    if (user.role === 1 || access.size === 0) {
      // console.log('canActivate user.role === 1 || access.size === 0', nextUrl, user);
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
    if (window.location.pathname === '/') {
      // console.log('canActivate window.location.pathname === /', nextUrl, user);
      this.router.navigate([home]);
      return false;
    } else {
      console.error(
        'canActivate else window.location.pathname === /',
        nextUrl,
        user
      );
      this.snackBar.open('У ВАС НЕДОСТАТОЧНО ПРАВ!!', '', {
        duration: 2000,
      });
      this.router.navigate([home]);
      return false;
    }
  }

  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // console.log('canActivateChild');
    return this.canActivate(route, state);
  }

  public canMatch(route: Route, segments: UrlSegment[]): boolean {
    // console.log('canLoad', route, segments);
    const path = segments
      .reduce((p, el) => {
        return (p += '/' + el.path);
      }, '')
      .replace(/^\//, '');
    // console.log('canLoad', route.path, path);
    const { user, access, home } = this.store.selectSnapshot(
      AuthState.getUserState
    );
    if (user.role === 1) {
      this.router.navigate(['/login']);
      return false;
    }
    if (user.role !== 1) {
      // tslint:disable-next-line: no-bitwise
      if (
        route.data &&
        route.data['role'] &&
        !!(route.data['role'] & (user.role ??= 0))
      ) {
        // console.log('canLoad route.data.role TRUE', route.path, path, home);
        return true;
      }
      if (AuthState.hasAccess(path, access)) {
        // console.log('canLoad hasAccess', route.path, path);
        return true;
      }
    }
    console.error('canLoad FALSE', path, user, segments);
    this.snackBar.open('У ВАС НЕДОСТАТОЧНО ПРАВ!!', '', {
      duration: 2000,
    });
    this.router.navigate([home]);
    // this.router.navigate(['/login']);
    return false;
  }
}
