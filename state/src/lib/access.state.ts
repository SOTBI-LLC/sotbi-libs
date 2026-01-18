import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { AccessService } from '@sotbi/data-access';
import type { Access } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  CreateItem,
  DeleteItem,
  FetchAccess,
  GetItem,
  UpdateItem,
} from './access.actions';

export class AccessStateModel {
  public items: Access[] = [];
  public selected: Access | null = null;
  public count = 0;
  public loading = false;
}

@State<AccessStateModel>({
  name: 'access',
  defaults: {
    items: [],
    selected: null,
    count: 0,
    loading: false,
  },
})
@Injectable()
export class AccessState {
  private readonly itemsService = inject(AccessService);

  @Selector()
  public static getItems(state: AccessStateModel) {
    return state.items;
  }
  @Selector()
  public static getItem(state: AccessStateModel) {
    return state.selected;
  }

  @Selector()
  public static getCount(state: AccessStateModel) {
    return state.count;
  }

  @Action(FetchAccess, { cancelUncompleted: true })
  public fetchItems({ patchState, getState }: StateContext<AccessStateModel>) {
    const state = getState();
    if (!state.loading && !state.items.length) {
      patchState({ loading: true });
      return this.itemsService.GetAll().pipe(
        tap((items) => {
          patchState({
            items,
            count: items.length,
          });
        }),
        catchError((err) => {
          return throwError(() => err);
        }),
        finalize(() => patchState({ loading: false }))
      );
    }
    return of([]);
  }

  @Action(GetItem)
  public getItem(
    { patchState, getState }: StateContext<AccessStateModel>,
    { payload }: GetItem
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.items.find(({ id }) => id === payload.id);
    patchState({ selected, loading: false });
  }

  @Action(CreateItem)
  public createItem(
    { getState, patchState, setState }: StateContext<AccessStateModel>,
    { payload }: CreateItem
  ) {
    patchState({ loading: true });
    return this.itemsService.add(payload).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, result],
          selected: result,
          count: state.count + 1,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false }))
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, patchState, setState }: StateContext<AccessStateModel>,
    { payload }: UpdateItem
  ) {
    const state = getState();
    patchState({ loading: true });
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const items = [...state.items];
        const idx = items.findIndex(({ id }) => id === selected.id);
        items[idx] = selected;
        setState({ ...state, items, selected });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => {
        patchState({ loading: false });
      })
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<AccessStateModel>,
    { payload }: DeleteItem
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
          count: state.count - 1,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false }))
    );
  }
}
