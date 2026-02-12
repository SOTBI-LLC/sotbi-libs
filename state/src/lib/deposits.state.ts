import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { DepositService } from '@sotbi/data-access';
import type { Deposit } from '@sotbi/models';
import { forMap } from '@sotbi/utils';
import { catchError, tap, throwError } from 'rxjs';
import {
  AddDeposit,
  DeleteDeposit,
  EditDeposit,
  FetchDeposits,
  GetDeposit,
} from './deposits.actions';
import type { itemMap } from './simple-edit.state.model';

export class DepositStateModel {
  public items: Deposit[] = [];
  public map: itemMap = new Map();
  public selected: Deposit | null = null;
}

@State<DepositStateModel>({
  name: 'deposits',
  defaults: {
    items: [],
    map: new Map(),
    selected: null,
  },
})
@Injectable()
export class DepositsState implements NgxsOnInit {
  private readonly DepositSrv = inject(DepositService);

  @Selector()
  public static getState(state: DepositStateModel) {
    return state;
  }
  @Selector()
  public static getDeposit(state: DepositStateModel) {
    return state.selected;
  }
  @Selector()
  public static getItems(state: DepositStateModel) {
    return state.items;
  }
  @Selector()
  public static getMap(state: DepositStateModel) {
    return state.map;
  }

  public ngxsOnInit({ dispatch }: StateContext<DepositStateModel>) {
    dispatch(new FetchDeposits());
  }

  @Action(FetchDeposits, { cancelUncompleted: true })
  public fetchItems({ getState, setState }: StateContext<DepositStateModel>) {
    const state = getState();
    if (!state.items.length) {
      this.DepositSrv.getAll().pipe(
        tap((result) => {
          const mapItems = new Map(result.map(forMap));
          setState({
            ...state,
            items: result,
            map: mapItems,
          });
        }),
        catchError((error) => {
          console.error(error.message);
          return throwError(() => error);
        }),
      );
    }
  }

  @Action(GetDeposit)
  public getItem(
    { setState, getState }: StateContext<DepositStateModel>,
    { payload }: GetDeposit,
  ) {
    const state = getState();
    const items = [...state.items];
    const idx = items.findIndex(({ id }) => payload === id);
    if (!items[idx].name) {
      this.DepositSrv.get(payload)
        .pipe(
          tap((selected) => {
            items[idx] = selected;
            setState({ ...state, items, selected });
          }),
          catchError((err) => {
            console.error(err.message);
            return throwError(() => err);
          }),
        )
        .subscribe();
    } else {
      setState({ ...state, selected: items[idx] });
    }
  }

  @Action(AddDeposit)
  public addItem(
    { getState, setState }: StateContext<DepositStateModel>,
    { payload }: AddDeposit,
  ) {
    return this.DepositSrv.create(payload).pipe(
      tap((selected) => {
        const state = getState();
        const map = { ...state.map };
        map.set(selected.id, selected.name);
        setState({
          ...state,
          items: [selected, ...state.items],
          map,
          selected,
        });
      }),
      catchError((err) => {
        console.error(err.message);
        return throwError(() => err);
      }),
    );
  }

  @Action(EditDeposit)
  public editItem(
    { getState, setState }: StateContext<DepositStateModel>,
    { payload }: EditDeposit,
  ) {
    const { id, ...rest } = payload;
    if (id) {
      this.DepositSrv.save(id, rest).pipe(
        tap((selected: Deposit) => {
          const state = getState();
          const map = { ...state.map };
          map.set(id, selected.name);
          const items = state.items.map((el) => (el.id === id ? selected : el));
          setState({ ...state, items, map, selected });
        }),
        catchError((err) => {
          console.error(err.message);
          return throwError(() => err);
        }),
      );
    }
  }

  @Action(DeleteDeposit)
  public deleteItem(
    { getState, setState }: StateContext<DepositStateModel>,
    { payload }: DeleteDeposit,
  ) {
    return this.DepositSrv.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const map = { ...state.map };
        map.delete(payload);
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
          map,
        });
      }),
      catchError((err) => {
        console.error(err.message);
        return throwError(() => err);
      }),
    );
  }
}
