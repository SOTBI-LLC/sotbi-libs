import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Login, LoginAs, Logout, RefreshToken } from './store/auth.actions';
import { AuthState, AuthStateModel } from './store/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store);

  public readonly userState = this.store.select<AuthStateModel>(
    AuthState.getUserState
  );

  public login(username: string, password: string): Observable<void> {
    return this.store.dispatch(new Login({ username, password }));
  }

  public loginAs(userId: number): Observable<void> {
    return this.store.dispatch(new LoginAs(userId));
  }

  public logout(): Observable<void> {
    return this.store.dispatch(new Logout());
  }

  public isLogged$(): Observable<boolean> {
    return this.userState.pipe(
      map(({ user }) => {
        return !!(user.role && user.role !== 1);
      })
    );
  }

  public refreshToken() {
    const refreshToken = this.store.selectSnapshot(AuthState.getRefreshToken);
    return this.store.dispatch(new RefreshToken(refreshToken));
  }

  public isOwned$(id: number): Observable<boolean> {
    return this.userState.pipe(
      map(({ user }) => {
        return user.id === id;
      })
    );
  }

  public hasRole(mask: number): Observable<boolean> {
    return this.userState.pipe(
      map(({ user }) => {
        // tslint:disable-next-line: no-bitwise
        return !!(mask & (user.role ?? 0));
      })
    );
  }

  public hasAcces$(path: string): Observable<boolean> {
    return this.userState.pipe(
      map(({ access }) =>
        AuthState.hasAccess(path, new Set(Array.from(access).filter(Boolean)))
      )
    );
  }
}
