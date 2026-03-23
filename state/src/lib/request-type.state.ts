import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { RequestTypeService } from '@sotbi/data-access';
import type { RequestType } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { FetchRequests, GetRequest } from './request-type.actions';

export class RequestTypeStateModel {
  public items: RequestType[] = [];
  public selected: RequestType | null | undefined = null;
  public count = 0;
  public loading = false;
}

@State<RequestTypeStateModel>({
  name: 'request_type',
  defaults: {
    items: [],
    count: 0,
    selected: null,
    loading: false,
  },
})
@Injectable()
export class RequestTypeState implements NgxsOnInit {
  private readonly itemsService = inject(RequestTypeService);

  @Selector()
  public static getItems(state: RequestTypeStateModel) {
    return state.items;
  }

  @Selector()
  public static getCount(state: RequestTypeStateModel) {
    return state.count;
  }

  @Selector()
  public static getSelected(state: RequestTypeStateModel) {
    return state.selected;
  }

  public ngxsOnInit({ dispatch }: StateContext<RequestTypeStateModel>) {
    dispatch(new FetchRequests());
  }

  @Action(FetchRequests, { cancelUncompleted: false })
  public fetchItems({
    getState,
    patchState,
  }: StateContext<RequestTypeStateModel>) {
    const state = getState();
    if (!state.loading && state.items.length === 0) {
      patchState({ loading: true });
      return this.itemsService.GetAll().pipe(
        tap((items: RequestType[]) => {
          patchState({
            items,
            count: items.length,
          });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
        finalize(() => patchState({ loading: false })),
      );
    }
    return of([]);
  }
  @Action(GetRequest)
  public getItem(
    { patchState, getState }: StateContext<RequestTypeStateModel>,
    { payload }: GetRequest,
  ) {
    patchState({ loading: true });
    const state = getState();
    let selected: RequestType | undefined;
    if (state.items.length > 0) {
      selected = state.items.find(({ id }) => id === payload);
      return patchState({ selected, loading: false });
    } else {
      return this.itemsService.get(payload).pipe(
        tap((selected) => {
          patchState({ selected });
        }),
        catchError((err) => {
          throw 'error fetching item. Details: ' + err.message;
        }),
        finalize(() => patchState({ loading: false })),
      );
    }
  }
}
