import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State, Store } from '@ngxs/store';
import { UsergroupService } from '@sotbi/data-access';
import type { UserGroup } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import {
  CreateUserGroup,
  DeleteUserGroup,
  FetchGroups,
  GetUserGroup,
  UpdateUserGroup,
} from './usergroup.actions';

export class UserGroupStateModel {
  public items: UserGroup[] = [];
  public selected: UserGroup | null = null;
  public count = 0;
  public loading?: boolean;
}

@State<UserGroupStateModel>({
  name: 'usergroups',
  defaults: {
    items: [],
    selected: null as UserGroup | null,
    count: 0,
    loading: false,
  },
})
@Injectable()
export class UserGroupState {
  private readonly itemsService = inject(UsergroupService);
  private readonly store = inject(Store);

  @Selector()
  public static loading(state: UserGroupStateModel) {
    return state.loading;
  }

  @Selector()
  public static getItems(state: UserGroupStateModel) {
    return state.items;
  }

  @Selector()
  public static getItem(state: UserGroupStateModel) {
    return state.selected;
  }

  @Selector()
  public static getCount(state: UserGroupStateModel) {
    return state.count;
  }

  @Action(FetchGroups, { cancelUncompleted: false })
  public fetchGroups(
    { patchState, getState }: StateContext<UserGroupStateModel>,
    { payload }: FetchGroups,
  ) {
    const state = getState();
    const notAdminFilter = (ug: UserGroup) => payload || ug.level !== 256; // https://ourzoo.online:8443/browse/BH-304
    if (!state.loading && !state.items.length) {
      patchState({ loading: true });
      return this.itemsService.getAll().pipe(
        map((res) => res.filter(notAdminFilter)),
        tap((result) => {
          patchState({ items: result, count: result.length });
        }),
        catchError((err) => {
          return throwError(() => err);
        }),
        finalize(() => patchState({ loading: false })),
      );
    }
    return of();
  }

  @Action(GetUserGroup)
  public getItem(
    { patchState, getState }: StateContext<UserGroupStateModel>,
    { payload }: GetUserGroup,
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.items.find(({ id }) => id === payload);
    patchState({ selected, loading: false });
  }

  @Action(CreateUserGroup)
  public createItem(
    { getState, patchState, setState }: StateContext<UserGroupStateModel>,
    { payload }: CreateUserGroup,
  ) {
    patchState({ loading: true });
    return this.itemsService.create(payload).pipe(
      tap((selected) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, selected],
          selected,
          count: state.count++,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateUserGroup)
  public updateItem(
    { getState, patchState }: StateContext<UserGroupStateModel>,
    { payload }: UpdateUserGroup,
  ) {
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const state = getState();
        const items = [...state.items];
        const idx = items.findIndex(({ id }) => id === selected.id);
        items[idx] = selected;
        patchState({ items, selected });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(DeleteUserGroup)
  public deleteItem(
    { getState, patchState, setState }: StateContext<UserGroupStateModel>,
    { payload }: DeleteUserGroup,
  ) {
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = [...state.items];
        const idx = items.findIndex(({ id }) => id === payload);
        items.splice(idx, 1);
        setState({
          ...state,
          items,
          selected: null,
          count: state.count--,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
