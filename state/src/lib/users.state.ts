import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { UserPositionService, UserService } from '@sotbi/data-access';
import type {
  HeadDepartment,
  HeadDepartmentChef,
  itemMapPair,
  Pair,
  Staff,
  User,
  UserPosition,
  UserShort,
} from '@sotbi/models';
import { extractProperty, generateAvatarSvgUrl } from '@sotbi/utils';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { EditStaff } from './staffs.actions';
import {
  AddDirtyItem,
  AddUser,
  ClearDirtyPositions,
  DeleteUser,
  EditUser,
  EditUserPosition,
  FetchUsers,
  FillUsersShort,
  FilterUsers,
  GetUser,
  GetUserHeadDepartment,
  ResetUserHeadDepartment,
  StartEditItem,
} from './users.actions';

export class UsersStateModel {
  public loading = false;
  public items: User[] = [];
  public selected: User | null = null;
  public shortItems: UserShort[] = [];
  public avatars: itemMapPair<string> = new Map();
  public toFilter: Set<number> = new Set();
  public headDepartment?: [HeadDepartmentChef, HeadDepartment] | null = null;
}

@State<UsersStateModel>({
  name: 'users',
  defaults: {
    loading: false,
    avatars: new Map(),
    shortItems: [],
    items: [],
    selected: null,
    toFilter: new Set(),
    headDepartment: null,
  },
})
@Injectable()
export class UsersState {
  private readonly userSrv = inject(UserService);
  private readonly userPosSrv = inject(UserPositionService);

  // Error messages for consistent logging
  private readonly ERROR_MESSAGES = {
    FETCH_USERS_FAILED: 'Failed to fetch users',
    FILL_USERS_SHORT_FAILED: 'Failed to fill short users',
    GET_USER_FAILED: 'Failed to get user',
    ADD_USER_FAILED: 'Failed to add user',
    EDIT_USER_FAILED: 'Failed to edit user',
    DELETE_USER_FAILED: 'Failed to delete user',
    INVALID_POSITION_INDEX: 'Invalid position index provided',
    USER_NOT_FOUND: 'User not found in state',
  } as const;

  @Selector()
  public static getItems(state: UsersStateModel) {
    return state.items;
  }

  @Selector()
  public static getFilteredItems(state: UsersStateModel) {
    if (state.toFilter.size > 0) {
      return state.items.filter((el) => state.toFilter.has(el.id ?? 0));
    }
    return [];
  }

  @Selector()
  public static loading(state: UsersStateModel): boolean {
    return state.loading;
  }

  /** only active users  */
  @Selector()
  public static getShortItems(state: UsersStateModel): UserShort[] {
    return state.shortItems;
  }

  @Selector()
  public static getUserNames(state: UsersStateModel): string[] {
    return extractProperty(state.shortItems, 'user');
  }

  @Selector()
  public static getAvatars(state: UsersStateModel): itemMapPair<string> {
    return state.avatars;
  }

  @Selector()
  public static selected(state: UsersStateModel) {
    return state.selected;
  }

  @Selector()
  public static getHeadDepartment(state: UsersStateModel) {
    return state.headDepartment;
  }

  // Helper methods for consistent error handling
  private handleError(
    operation: keyof typeof this.ERROR_MESSAGES,
    error: unknown,
  ): Observable<never> {
    const message = this.ERROR_MESSAGES[operation];
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('UsersState::handleError() -> Error:', error);

    return throwError(() => new Error(`${message}: ${errorMessage}`));
  }

  private handleLoadingError(
    patchState: StateContext<UsersStateModel>['patchState'],
    operation: keyof typeof this.ERROR_MESSAGES,
    error: unknown,
  ): Observable<never> {
    patchState({ loading: false });
    return this.handleError(operation, error);
  }

  // Helper methods for avatar generation
  private ensureAvatar(user: User | UserShort): void {
    if (!user.avatar) {
      user.avatar = generateAvatarSvgUrl(user.user);
    }
  }

  // Validation helpers
  private isValidPositionIndex(
    positions: UserPosition[],
    index: number,
  ): boolean {
    return index >= 0 && index < positions.length && positions[index] != null;
  }

  @Action(FillUsersShort)
  public fillUsersShort({
    getState,
    patchState,
  }: StateContext<UsersStateModel>) {
    const state = getState();
    // this.log.debug('UsersState::FillUsersShort →', state.avatars);

    if (!state.avatars.size) {
      patchState({ loading: true }); // ✅ Set loading to true

      return this.userSrv.getUsersShort().pipe(
        tap((shortItems: UserShort[]) => {
          const avatars = new Map();
          shortItems.forEach((el) => {
            this.ensureAvatar(el); // ✅ Use helper method
            const pair: Pair<string> = [el.user, el.avatar];
            avatars.set(el.id, pair);
          });
          patchState({ shortItems, avatars });
        }),
        finalize(() => patchState({ loading: false })),
        catchError((err) =>
          this.handleLoadingError(patchState, 'FILL_USERS_SHORT_FAILED', err),
        ),
      );
    }

    return of(null); // ✅ Return observable for consistency
  }

  @Action(FilterUsers)
  public filterItems(
    { patchState }: StateContext<UsersStateModel>,
    { payload }: FilterUsers,
  ) {
    // this.log.debug('UsersState::FilterUsers →', payload);
    if (payload.size > 0) {
      patchState({ toFilter: payload });
    }
  }

  @Action(FetchUsers, { cancelUncompleted: true })
  public fetchItems(
    { getState, patchState }: StateContext<UsersStateModel>,
    { payload }: FetchUsers,
  ) {
    // this.log.debug('UsersState::FetchUsers →', payload);
    patchState({ loading: true });

    const state = getState();
    if (payload.refresh || state.items.length === 0) {
      return this.userSrv.getAll([], [], payload.loadFired).pipe(
        tap((items: User[]) => {
          items.forEach((val) => this.ensureAvatar(val)); // ✅ Use helper method
          patchState({ items });
        }),
        finalize(() => patchState({ loading: false })),
        catchError((err) =>
          this.handleLoadingError(patchState, 'FETCH_USERS_FAILED', err),
        ),
      );
    } else {
      patchState({ loading: false }); // ✅ Reset loading when no fetch needed
      return of(null);
    }
  }

  @Action(GetUser, { cancelUncompleted: true })
  public getItem(
    { getState, patchState }: StateContext<UsersStateModel>,
    { payload }: GetUser,
  ) {
    // this.log.debug(`UsersState::GetUser →`, payload);
    patchState({ loading: true });

    if (payload.id === 0) {
      return patchState({
        selected: { id: 0, user: '', role: 2 } as User,
        loading: false,
      });
    }

    const state = getState();

    if (state.items.length > 0 && !payload.refresh) {
      // ✅ Proper null checking instead of force-casting
      const selected = state.items.find(({ id }) => id === payload.id);
      if (selected) {
        return patchState({ selected, loading: false });
      }
    }

    return this.userSrv.get(payload.id).pipe(
      tap((item) => {
        item.settings = item.settings || 0;
        patchState({ selected: item });
      }),
      finalize(() => patchState({ loading: false })),
      catchError((err) =>
        this.handleLoadingError(patchState, 'GET_USER_FAILED', err),
      ),
    );
  }

  @Action(AddUser)
  public addItem(
    { getState, setState }: StateContext<UsersStateModel>,
    { payload }: AddUser,
  ) {
    return this.userSrv.create(payload).pipe(
      tap((result: User) => {
        this.ensureAvatar(result); // ✅ Ensure avatar is set

        const state = getState();
        const avatars = new Map(state.avatars); // ✅ Create new Map
        avatars.set(result.id ?? 0, [result.user, result.avatar]);

        setState({
          ...state,
          selected: result,
          items: [...state.items, result],
          shortItems: [
            ...state.shortItems,
            { id: result.id, user: result.user, avatar: result.avatar },
          ],
          avatars,
        });
      }),
      catchError((err) => this.handleError('ADD_USER_FAILED', err)),
    );
  }

  @Action(AddDirtyItem)
  public addDirtyUserPosition(
    { getState, patchState }: StateContext<UsersStateModel>,
    { payload }: AddDirtyItem,
  ) {
    const state = getState();

    // ✅ Create immutable copy instead of mutating
    const selected = {
      ...state.selected,
      users_positions: [...(state.selected?.users_positions ?? []), payload],
    } as User;

    return patchState({ selected });
  }

  @Action(ClearDirtyPositions)
  public clearDirtyPositions({
    getState,
    patchState,
  }: StateContext<UsersStateModel>) {
    const state = getState();
    if (state.selected) {
      // ✅ Create immutable copy
      const selected: User = {
        ...state.selected,
        users_positions:
          state.selected?.users_positions?.filter(
            (item: UserPosition) => item.id,
          ) || [],
      };

      // console.debug('ClearDirtyPositions: updated selected user', selected); // ✅ Use proper logging

      return patchState({ selected });
    }
  }

  @Action(StartEditItem)
  public startEditItem(
    { getState, patchState }: StateContext<UsersStateModel>,
    { payload }: StartEditItem,
  ) {
    const state = getState();
    if (state.selected) {
      const selected: User = { ...state.selected };

      if (!selected.users_positions) {
        selected.users_positions = [] as UserPosition[];
      }

      // ✅ Robust bounds checking with validation
      if (this.isValidPositionIndex(selected.users_positions, payload.id)) {
        // ✅ Create immutable copy of the array
        selected.users_positions = selected.users_positions.map((pos, index) =>
          index === payload.id ? { ...pos, dirty: payload.dirty } : pos,
        );
      }

      return patchState({ selected });
    }
  }

  @Action(EditUser)
  public editItem(
    { getState, patchState, dispatch }: StateContext<UsersStateModel>,
    { payload }: EditUser,
  ) {
    patchState({ loading: true });
    const { id } = payload;
    delete payload.id;

    let staff: Staff;
    let staff$: Observable<void | Staff[]>;

    if (payload.staffs) {
      staff = structuredClone(payload.staffs);
      staff$ = dispatch(new EditStaff(staff));
      delete payload.staffs;
    } else {
      staff$ = of([]);
    }

    return staff$.pipe(
      switchMap(() => {
        return this.userSrv.save(id ?? 0, payload).pipe(
          tap((selected: User) => {
            if (staff !== undefined) {
              selected.staffs = staff;
            }

            this.ensureAvatar(selected); // ✅ Ensure avatar

            const state = getState();
            const items = [
              ...state.items.map((el) =>
                el.id === selected.id ? selected : el,
              ),
            ];
            const shortItems = [
              ...state.shortItems.map((el) =>
                el.id === selected.id
                  ? {
                      id: selected.id,
                      user: selected.user,
                      avatar: selected.avatar,
                    }
                  : el,
              ),
            ];
            const avatars = new Map(state.avatars); // ✅ Create new Map
            avatars.set(selected.id ?? 0, [selected.user, selected.avatar]);

            patchState({
              items,
              avatars,
              shortItems,
              selected,
              loading: false,
            });
          }),
          catchError((err) =>
            this.handleLoadingError(patchState, 'EDIT_USER_FAILED', err),
          ),
        );
      }),
      catchError((err) =>
        this.handleLoadingError(patchState, 'EDIT_USER_FAILED', err),
      ),
    );
  }

  @Action(EditUserPosition)
  public editUserPosition(
    { getState, setState }: StateContext<UsersStateModel>,
    { payload }: EditUserPosition,
  ) {
    const state = getState();
    if (state.selected) {
      const selected: User = { ...state.selected };

      payload = payload.map((item: UserPosition) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updated_by, position, updated_by_id, ...rest } = item;
        return item.dirty ? rest : { ...rest, updated_by_id };
      });

      return this.userPosSrv.batchUpdate(payload).pipe(
        tap((res) => {
          selected.users_positions = res;
          setState({
            ...state,
            selected,
          });
        }),
        catchError((err) => this.handleError('EDIT_USER_FAILED', err)),
      );
    }
    return;
  }

  @Action(DeleteUser)
  public deleteItem(
    { getState, setState }: StateContext<UsersStateModel>,
    { payload }: DeleteUser,
  ) {
    return this.userSrv.fire(payload).pipe(
      tap(() => {
        const state = getState();
        const avatars = new Map(state.avatars); // ✅ Create new Map
        avatars.delete(payload);

        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
          shortItems: state.shortItems.filter((el) => el.id !== payload),
          avatars,
        });
      }),
      catchError((err) => this.handleError('DELETE_USER_FAILED', err)),
    );
  }

  @Action(GetUserHeadDepartment)
  public getUserHeadDepartment(
    { getState, patchState }: StateContext<UsersStateModel>,
    { payload }: GetUserHeadDepartment,
  ) {
    const { headDepartment, selected } = getState();

    if (headDepartment && payload === selected?.id) {
      return;
    }

    patchState({ loading: true });
    return this.userSrv.getHeadDepartment(payload).pipe(
      tap((headDepartmentValue) => {
        patchState({ headDepartment: headDepartmentValue });
      }),
      finalize(() => patchState({ loading: false })),
      catchError((err) =>
        this.handleLoadingError(patchState, 'GET_USER_FAILED', err),
      ),
    );
  }

  @Action(ResetUserHeadDepartment)
  public resetUserHeadDepartment({
    patchState,
  }: StateContext<UsersStateModel>) {
    patchState({ headDepartment: null });
  }
}
