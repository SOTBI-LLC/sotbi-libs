import { inject, Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { TransitionService } from '@root/service/transition.service';
import { RequestType, StatusEnum, Transition } from '@sotbi/models';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddEmptyTransition,
  CreateTransition,
  DeleteItem,
  FetchTransitions,
  GetTransition,
  UpdateTransition,
} from './transition.actions';

import StateMachine from 'javascript-state-machine';

export class TransitionStateModel {
  public items: Transition[] = [];
  public selected: Partial<Transition> | null = null;
  public loading: boolean = false;
}

@State<TransitionStateModel>({
  name: 'transition',
  defaults: {
    items: [],
    selected: null,
    loading: false,
  },
})
@Injectable()
export class TransitionState {
  private readonly itemsService = inject(TransitionService);

  private readonly rowData: Transition = {
    id: 0,
    state: [],
    next_state: null,
    request_type_id: 0,
    request_type: null,
    events: [],
  };

  @Selector()
  public static getItems(state: TransitionStateModel) {
    return state.items;
  }

  @Selector()
  public static getItem(state: TransitionStateModel) {
    return state.selected;
  }

  public static filtered(typeId: RequestType) {
    return createSelector([TransitionState], ({ items }) => {
      return items.filter((item: Transition) => item.request_type === typeId);
    });
  }

  public static getFSM(initial: StatusEnum) {
    return createSelector([TransitionState], ({ items }) => {
      const fsm = StateMachine.create({
        initial,
        events: items.map((item: Transition) => {
          return {
            name: item.next_state,
            from: item.state,
            to: item.next_state,
          };
        }),
      });
      return fsm;
    });
  }

  @Action(FetchTransitions, { cancelUncompleted: true })
  public fetchItems(
    { patchState }: StateContext<TransitionStateModel>,
    { payload }: FetchTransitions,
  ) {
    patchState({ loading: true });
    return this.itemsService.allByName(payload).pipe(
      tap((items) => {
        patchState({
          items,
        });
      }),
      catchError((err) => {
        throw 'error fetching items. Details: ' + err.message;
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(GetTransition)
  public getItem(
    { patchState, getState }: StateContext<TransitionStateModel>,
    { payload }: GetTransition,
  ) {
    patchState({ loading: true });
    const state = getState();
    let selected: Partial<Transition>;
    if (state.items.length > 0) {
      selected = state.items.find(({ id }) => id === payload) ?? {};
      patchState({ selected, loading: false });
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

  @Action(CreateTransition)
  public createItem(
    { getState, patchState, setState }: StateContext<TransitionStateModel>,
    { payload }: CreateTransition,
  ) {
    patchState({ loading: true });
    return this.itemsService.add(payload).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, result],
          selected: result,
        });
      }),
      catchError((err) => {
        throw 'error creating item. Details: ' + err.message;
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateTransition)
  public updateItem(
    { getState, patchState }: StateContext<TransitionStateModel>,
    { payload }: UpdateTransition,
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
        throw 'error updating item. Details: ' + err.message;
      }),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<TransitionStateModel>,
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
        });
      }),
      catchError((err) => {
        throw 'error deleting item. Details: ' + err;
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(AddEmptyTransition)
  public addEmptyItem(
    { patchState }: StateContext<TransitionStateModel>,
    { payload }: AddEmptyTransition,
  ) {
    const selected = { ...this.rowData } as Transition;
    selected.request_type = payload;
    return patchState({ selected });
  }
}
