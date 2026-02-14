import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State, Store } from '@ngxs/store';
import { AuthState } from '@sotbi/auth';
import { UsergroupService } from '@sotbi/data-access';
import type { UserGroup } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import {
  CreateItem,
  DeleteItem,
  FetchGroups,
  GetItem,
  UpdateItem,
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
export class UserGroupState implements NgxsOnInit {
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

  public ngxsOnInit({ dispatch }: StateContext<UserGroupStateModel>) {
    dispatch(new FetchGroups());
  }

  @Action(FetchGroups, { cancelUncompleted: false })
  public fetchGroups({
    patchState,
    getState,
  }: StateContext<UserGroupStateModel>) {
    const state = getState();
    const isAdmin = this.store.selectSnapshot(AuthState.isAdmin);
    const notAdminFilter = (ug: UserGroup) => isAdmin || ug.level !== 256; // https://ourzoo.online:8443/browse/BH-304
    if (!state.loading && !state.items.length) {
      patchState({ loading: true });
      this.itemsService.getAll().pipe(
        map((res) => res.filter(notAdminFilter)),
        tap((result) => {
          patchState({ items: result, count: result.length });
        }),
        catchError((err) => {
          return throwError(err);
        }),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetItem)
  public getItem(
    { patchState, getState }: StateContext<UserGroupStateModel>,
    { payload }: GetItem,
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.items.find(({ id }) => id === payload);
    patchState({ selected, loading: false });
  }

  @Action(CreateItem)
  public createItem(
    { getState, patchState, setState }: StateContext<UserGroupStateModel>,
    { payload }: CreateItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.create(payload).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, result],
          selected: result,
          count: state.count++,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, patchState }: StateContext<UserGroupStateModel>,
    { payload }: UpdateItem,
  ) {
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const items = state.items;
        const idx = items.findIndex(({ id }) => id === selected.id);
        items[idx] = selected;
        patchState({ items, selected });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<UserGroupStateModel>,
    { payload }: DeleteItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items;
        const idx = items.findIndex(({ id }) => id === payload);
        items.splice(idx, 1);
        setState({
          ...state,
          items,
          selected: null,
          count: state.count--,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
