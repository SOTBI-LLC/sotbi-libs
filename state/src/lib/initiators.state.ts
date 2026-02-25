import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { InitiatorService } from '@sotbi/data-access';
import { Initiator } from '@sotbi/models';
import { catchError, of, tap, throwError } from 'rxjs';
import {
  AddInintiator,
  DeleteInitiator,
  EditInitiator,
  FetchInitiators,
  GetInintiator,
} from './initiators.actions';

export class InitiatorsStateModel {
  public items: Initiator[] = [];
  public selected: Initiator | null = null;
}

@State<InitiatorsStateModel>({
  name: 'initiators',
  defaults: {
    items: [],
    selected: null,
  },
})
@Injectable()
export class InitiatorsState {
  private readonly initiatorSrv = inject(InitiatorService);

  @Selector()
  public static getItems(state: InitiatorsStateModel): Initiator[] {
    return state.items;
  }

  @Selector()
  public static getItem(state: InitiatorsStateModel): Initiator | null {
    return state.selected;
  }

  @Action(FetchInitiators, { cancelUncompleted: true })
  public fetchItems({
    getState,
    patchState,
  }: StateContext<InitiatorsStateModel>) {
    const state = getState();
    if (!state.items.length) {
      return this.initiatorSrv.GetAll().pipe(
        tap((items) => {
          patchState({ items, selected: null });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
      );
    }
    return of();
  }

  @Action(GetInintiator)
  public getItem(
    { setState, getState }: StateContext<InitiatorsStateModel>,
    { payload }: GetInintiator,
  ) {
    const state = getState();
    if (!payload) {
      return setState({
        ...state,
        selected: new Initiator(),
      });
    }
    if (state.selected?.id !== payload) {
      return this.initiatorSrv.get(payload).pipe(
        tap((selected) => {
          if (!selected?.accreditations) {
            selected.accreditations = [];
          }
          setState({ ...state, selected });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
      );
    }
  }

  @Action(AddInintiator)
  public addItem(
    { getState, setState }: StateContext<InitiatorsStateModel>,
    { payload }: AddInintiator,
  ) {
    const state = getState();
    return this.initiatorSrv.add(payload).pipe(
      tap((selected) => {
        if (!selected?.accreditations) {
          selected.accreditations = [];
        }
        setState({
          ...state,
          items: [...state.items, selected],
          selected,
        });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  @Action(EditInitiator)
  public editItem(
    { getState, setState }: StateContext<InitiatorsStateModel>,
    { payload }: EditInitiator,
  ) {
    const state = getState();
    const { id } = payload;
    return this.initiatorSrv.update(payload).pipe(
      tap((selected) => {
        const items = state.items.map((el) => (el.id === id ? selected : el));
        setState({ ...state, items, selected });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  @Action(DeleteInitiator)
  public deleteItem(
    { getState, setState }: StateContext<InitiatorsStateModel>,
    { payload }: DeleteInitiator,
  ) {
    return this.initiatorSrv.delete(payload).pipe(
      tap(() => {
        const state = getState();
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
          selected: null,
        });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }
}
