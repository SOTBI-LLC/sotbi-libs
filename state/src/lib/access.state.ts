import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { AccessService } from '@sotbi/data-access';
import type { Access } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  CreateAccess,
  DeleteAccess,
  FetchAccess,
  GetAccess,
  UpdateAccess,
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
        finalize(() => patchState({ loading: false })),
      );
    }
    return of([]);
  }

  @Action(GetAccess)
  public getItem(
    { patchState, getState }: StateContext<AccessStateModel>,
    { payload }: GetAccess,
  ) {
    const state = getState();
    const selected = state.items.find(({ id }) => id === payload.id);
    patchState({ selected });
  }

  @Action(CreateAccess)
  public createItem(
    { getState, patchState, setState }: StateContext<AccessStateModel>,
    { payload }: CreateAccess,
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
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateAccess)
  public updateItem(
    { getState, patchState, setState }: StateContext<AccessStateModel>,
    { payload }: UpdateAccess,
  ) {
    patchState({ loading: true });
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const state = getState();
        const items = state.items.map((item) =>
          item.id === selected.id ? selected : item,
        );
        setState({
          ...state,
          items,
          selected:
            !state.selected || state.selected.id === selected.id
              ? selected
              : state.selected,
        });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(DeleteAccess)
  public deleteItem(
    { getState, patchState, setState }: StateContext<AccessStateModel>,
    { payload }: DeleteAccess,
  ) {
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter(({ id }) => id !== payload);
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
      finalize(() => patchState({ loading: false })),
    );
  }
}
