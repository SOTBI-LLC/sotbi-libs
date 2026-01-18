import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DefraymentService } from '@services/defrayment.service';
import { removeID } from '@shared/shared-globals';
import { Defrayment } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AddItem, DeleteItem, GetAllItems, GetItem, UpdateItem } from './defrayment.actions';

export interface DefraymentStateModel {
  items: Defrayment[];
  selected: Defrayment;
  loading?: boolean;
  count: number;
}

@State<DefraymentStateModel>({
  name: 'defrayment',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class DefraymentState {
  private readonly itemsService = inject(DefraymentService);

  @Selector()
  public static getLoading(state: DefraymentStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: DefraymentStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: DefraymentStateModel): Defrayment[] {
    return state.items;
  }

  @Action(GetAllItems)
  public GetAllItems(
    { getState, setState, patchState }: StateContext<DefraymentStateModel>,
    { payload },
  ) {
    // console.log('DefraymentState::FetchItems');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.GetAll(payload).pipe(
        tap((items) => {
          setState({
            ...state,
            selected: null,
            items,
            count: items.length,
          });
        }),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetItem)
  public getItem({ patchState }: StateContext<DefraymentStateModel>, { payload }) {
    patchState({ loading: true });
    if (!payload) {
      const selected: Defrayment = {
        id: 0,
        payment_request_id: 0,
        summ: 0,
        payment_purpose: null,
        priority: 5,
        creator_id: null,
      };
      return patchState({ selected });
    } else {
      return this.itemsService.get(payload).pipe(
        tap((item) => patchState({ selected: item })),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(AddItem)
  public createItem(
    { getState, patchState, setState }: StateContext<DefraymentStateModel>,
    { payload },
  ) {
    // console.log('DefraymentState::AddItem', payload);
    patchState({ loading: true });
    return this.itemsService.add(removeID(payload)).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [result, ...state.items],
          selected: result,
          count: state.count++,
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public UpdateItem(
    { getState, setState, patchState }: StateContext<DefraymentStateModel>,
    { payload },
  ) {
    // console.log('DefraymentState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const idx = state.items.findIndex(({ id }) => id === selected.id);
        state.items[idx] = selected;
        setState({
          ...state,
          items: state.items,
          selected,
        });
        patchState({ selected: payload });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<DefraymentStateModel>,
    { payload },
  ) {
    // console.log('DefraymentState::DeleteItem', payload);
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          ...state,
          items,
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
