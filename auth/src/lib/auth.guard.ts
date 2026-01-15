import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type {
  ActivatedRouteSnapshot,
  CanActivate,
  Route,
  RouterStateSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import type { Observable } from 'rxjs';
import { AuthState } from './store/auth.state';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly store = inject(Store);

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.getItem('currentUser')) {
      if (next.data['title']) {
        this.title.setTitle(next.data['title']);
      }
      // logged in so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  public canLoad(
    route: Route
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.store.selectSnapshot(AuthState.isLogged)) {
      return true;
    }
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: route.path },
    });
    return false;
  }
}
