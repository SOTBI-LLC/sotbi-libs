import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, createSelector, Selector, State } from '@ngxs/store';
import { AccessService, UserService } from '@sotbi/data-access';
import type { User } from '@sotbi/models';
import { isBefore } from 'date-fns';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  GetAccess,
  Login,
  LoginAs,
  Logout,
  RefreshToken,
  Restore,
  UpdateMe,
} from './auth.actions';

const ADMIN_ROLE = 256;

export interface SotbiClaims extends JwtPayload {
  settings: number;
  role: number;
  staff: number;
}

export class AuthStateModel {
  public token: string | null = null;
  public refreshToken: string | null = null;
  public user: Partial<User> = {
    id: 0,
    user: '',
    role: 1,
    settings: 0,
    staff_type: -1,
  };
  public home = '/';
  public loading = false;
  public access: Set<string> = new Set();
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
    token: null,
    refreshToken: null,
    home: '/',
    loading: false,
    access: new Set(),
  },
})
@Injectable()
export class AuthState implements NgxsOnInit {
  private readonly itemsService = inject(UserService);
  private readonly accessService = inject(AccessService);
  private readonly router = inject(Router);

  private readonly refreshStorageKey = 'refreshUser';
  private readonly sessionStorageKey = 'currentUser';
  private readonly sessionAccessKey = 'currentAccess';
  private readonly defaultUser: Partial<User> = {
    id: 0,
    user: '',
    role: 1,
    settings: 0,
    staff_type: -1,
  };

  public static hasAccess(
    path: string,
    accessSet: Set<string> = new Set()
  ): boolean {
    path = path.replace(/^\/+|\/+$/, '');
    if (accessSet.has(path)) {
      return true;
    } else {
      for (const item of accessSet) {
        const regex = new RegExp(
          item
            .replace('/', '\\/')
            .replace(/(.+)/, '^$1$')
            .replace(/:\w?id/gm, '\\d+')
            .replace(/\/:[^/$]+/gm, '/[^\\/\\$]+'),
          'i'
        );
        // console.log({ path, item, regex }, !!path.match(regex));
        if (path.match(regex)) {
          return true;
        }
      }
    }
    return false;
  }

  public static hasAcces$(path: string) {
    return createSelector([AuthState], ({ access }) => {
      return AuthState.hasAccess(path, access);
    });
  }

  public static hasRole(role: number) {
    return createSelector([AuthState], ({ user }) => {
      return user.role === role;
    });
  }

  @Selector()
  public static isAdmin(state: AuthStateModel): boolean {
    return state.user.role === ADMIN_ROLE;
  }

  @Selector()
  public static isLogged(state: AuthStateModel): boolean {
    return !!(state.user.role && state.user.role !== 1);
  }

  @Selector()
  public static getUserState(state: AuthStateModel): AuthStateModel {
    return {
      user: state.user,
      access: state.access,
      home: state.home,
    } as AuthStateModel;
  }

  @Selector()
  public static getUserID(state: AuthStateModel): number {
    return state.user.id ?? 0;
  }

  @Selector()
  public static getUserRole(state: AuthStateModel): number {
    return state.user.role ?? 1;
  }

  @Selector()
  public static getUserSettings(state: AuthStateModel): number {
    return state.user.settings ?? 0;
  }

  @Selector()
  public static getUserStaffType(state: AuthStateModel): number {
    return state.user.staff_type ?? 0;
  }

  @Selector()
  public static getAccess(state: AuthStateModel): Set<string> {
    return state.access;
  }

  @Selector()
  public static getToken(state: AuthStateModel): string {
    return state.token ?? '';
  }

  @Selector()
  public static getTokens(state: AuthStateModel): {
    token: string;
    refreshToken: string;
  } {
    return { token: state.token ?? '', refreshToken: state.refreshToken ?? '' };
  }

  @Selector()
  public static getRefreshToken(state: AuthStateModel): string {
    return state.refreshToken ?? '';
  }

  @Selector()
  public static getCurrentUser(state: AuthStateModel): Partial<User> {
    return state.user;
  }

  @Selector()
  public static getHome(state: AuthStateModel): string {
    return state.home;
  }

  @Selector()
  public static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  public ngxsOnInit({ dispatch }: StateContext<AuthStateModel>) {
    dispatch(new Restore());
  }

  @Action(Restore)
  public restore({
    dispatch,
    getState,
    setState,
    patchState,
  }: StateContext<AuthStateModel>) {
    patchState({ loading: true });
    const token = localStorage.getItem(this.sessionStorageKey);
    const refreshToken = localStorage.getItem(this.refreshStorageKey);
    const accessJWT = localStorage.getItem(this.sessionAccessKey);
    if (!!token && !!accessJWT && !!refreshToken) {
      const state = getState();
      const { exp } = jwtDecode<JwtPayload>(refreshToken);
      const { jti, iss, role, aud, settings, staff } = jwtDecode<SotbiClaims>(
        token ?? ''
      ) ?? { jti: 0, iss: '', role: 1, aud: ['/'], settings: 0, staff: 0 };
      if (isBefore(new Date(+(exp ?? 0) * 1000), new Date())) {
        return dispatch(new Logout());
      }
      const decodedAccess = jwtDecode<JwtPayload>(accessJWT);
      setState({
        ...state,
        token,
        refreshToken,
        home: aud?.[0] ?? '/',
        access: new Set(decodedAccess.aud),
        user: { id: +(jti ?? 0), user: iss, role, settings, staff_type: staff },
      });
      dispatch(new GetAccess());
      return patchState({ loading: false });
    } else {
      return patchState({ user: this.defaultUser, loading: false });
    }
  }

  @Action(GetAccess)
  public getAccess({ dispatch, patchState }: StateContext<AuthStateModel>) {
    patchState({ loading: true });
    return this.accessService.getAccess().pipe(
      tap({
        next: (token) => {
          const { aud, exp } = jwtDecode<JwtPayload>(token);
          if (isBefore(new Date(+(exp ?? 0) * 1000), new Date())) {
            return dispatch(new Logout());
          }
          localStorage.setItem(this.sessionAccessKey, token);
          return patchState({ access: new Set(aud ?? ['/']) });
        },
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false }))
    );
  }

  @Action(UpdateMe)
  public updateMe(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: UpdateMe
  ) {
    patchState({ loading: true });
    return this.itemsService.saveMe(payload).pipe(
      tap((token: string) => {
        localStorage.setItem(this.sessionStorageKey, token);
        const { jti, iss, role, settings, staff } =
          jwtDecode<SotbiClaims>(token);
        patchState({
          user: {
            id: +(jti ?? 0),
            user: iss,
            role,
            settings,
            staff_type: staff,
          },
        });
      }),

      finalize(() => {
        patchState({ loading: false });
      })
    );
  }

  @Action(Login, { cancelUncompleted: true })
  public login(
    { dispatch, setState, getState, patchState }: StateContext<AuthStateModel>,
    { payload }: Login
  ) {
    patchState({ loading: true });
    return this.itemsService.login(payload).pipe(
      tap({
        next: ({ token, access, refresh_token }) => {
          // console.log('AuthState::Login::Access', jwtDecode<JwtPayload>(access));
          localStorage.setItem(this.sessionStorageKey, token);
          localStorage.setItem(this.sessionAccessKey, (access ??= ''));
          localStorage.setItem(this.refreshStorageKey, (refresh_token ??= ''));
          const state = getState();
          const { jti, iss, role, aud, settings, staff, exp } =
            jwtDecode<SotbiClaims>(token);
          if (isBefore(new Date(+(exp ?? 0) * 1000), new Date())) {
            return dispatch(new Logout());
          }
          const { aud: decodedAccess } = jwtDecode<JwtPayload>(access);
          return setState({
            ...state,
            token,
            refreshToken: refresh_token,
            user: {
              id: +(jti ?? 0),
              user: iss,
              role,
              settings,
              staff_type: staff,
            },
            home: aud?.[0] ?? '/',
            access: new Set(decodedAccess),
          });
        },
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false }))
    );
  }

  @Action(RefreshToken)
  public refereshToken(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: RefreshToken
  ) {
    patchState({ loading: true });
    return this.itemsService.refreshToken(payload).pipe(
      tap(({ token, refresh_token }) => {
        localStorage.setItem(this.sessionStorageKey, token);
        localStorage.setItem(this.refreshStorageKey, (refresh_token ??= ''));
        patchState({ token, refreshToken: refresh_token });
      })
    );
  }

  @Action(LoginAs, { cancelUncompleted: true })
  public loginAs(
    { setState, getState, patchState }: StateContext<AuthStateModel>,
    { payload }: LoginAs
  ) {
    // console.log('AuthState::LoginAs');
    patchState({ loading: true });
    return this.itemsService.loginAs(payload).pipe(
      tap({
        next: ({ token, access }) => {
          localStorage.setItem(this.sessionStorageKey, token);
          localStorage.setItem(this.sessionAccessKey, (access ??= ''));
          // console.log('AuthState::LoginAs::Access', jwtDecode<JwtPayload>(access));
          const state = getState();
          const { jti, iss, role, aud, settings } =
            jwtDecode<SotbiClaims>(token);
          const decodedAccess = jwtDecode<JwtPayload>(access);
          setState({
            ...state,
            token,
            user: { id: +(jti ?? 0), user: iss, role, settings },
            home: aud?.[0] ?? '/',
            access: new Set(decodedAccess.aud),
          });
        },
        error: (error) => {
          console.error(error.message);
        },
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false }))
    );
  }

  @Action(Logout, { cancelUncompleted: false })
  public logout({ patchState }: StateContext<AuthStateModel>) {
    localStorage.removeItem(this.sessionStorageKey);
    localStorage.removeItem(this.sessionAccessKey);
    patchState({ loading: true });
    return this.itemsService.logout().pipe(
      tap(() => patchState({ token: '', user: this.defaultUser })),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => {
        patchState({ loading: false });
        return this.router.navigate(['/login']);
      })
    );
  }
}
