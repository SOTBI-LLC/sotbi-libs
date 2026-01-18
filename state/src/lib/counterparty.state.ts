import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CounterpartyService } from '@root/service/counterparty.service';
import { LoggerService } from '@root/service/logger.service';
import { fromBase62, notifyError, removeID } from '@root/shared/shared-globals';
import { Counterparty } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddCounterparty,
  DeleteCounterparty,
  GetCounterparties,
  GetCounterparty,
  UpdateCounterparty,
} from './counterparty.actions';

export class CounterpartyStateModel {
  public items: Counterparty[] = [];
  public selected: Partial<Counterparty> | null;
  public loading: boolean;
  public count: number;
}

@State<CounterpartyStateModel>({
  name: 'counterparty',
  defaults: {
    items: [],
    selected: null,
    loading: false,
    count: 0,
  },
})
@Injectable()
export class CounterpartyState {
  private readonly itemsSvc = inject(CounterpartyService);
  private readonly log = inject(LoggerService);
  private readonly snackBar = inject(MatSnackBar);

  @Selector()
  public static getItems(state: CounterpartyStateModel): Counterparty[] {
    return state.items;
  }

  @Selector()
  public static getItem(state: CounterpartyStateModel): Partial<Counterparty> {
    return state.selected;
  }

  @Selector()
  public static loading(state: CounterpartyStateModel): boolean {
    return state.loading;
  }

  @Action(GetCounterparties, { cancelUncompleted: true })
  public getCounterparties({
    getState,
    setState,
    patchState,
  }: StateContext<CounterpartyStateModel>) {
    const state = getState();
    if (state.items.length < 1) {
      patchState({ loading: true });
      return this.itemsSvc.GetAll().pipe(
        tap((items) => {
          setState({
            ...state,
            selected: null,
            items,
            count: items.length,
          });
        }),
        catchError((err) => {
          console.error('CounterpartyState::GetCounterparties() -> Error:', err);
          return throwError(() => err);
        }),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    }
  }

  @Action(GetCounterparty)
  public getItem(
    { patchState, getState }: StateContext<CounterpartyStateModel>,
    { payload }: GetCounterparty,
  ) {
    const state = getState();
    if (!payload) {
      const selected: Partial<Counterparty> = {
        id: 0,
        name: '',
        kind: true,
        links: null,
        created_at: new Date(),
      };
      return patchState({ selected, loading: false });
    }
    const id = fromBase62(payload);
    if (id !== +state.selected?.id) {
      patchState({ loading: true });
      return this.itemsSvc.get(id).pipe(
        tap((selected) => {
          patchState({ selected });
        }),
        catchError((err) => {
          console.error('CounterpartyState::GetCounterparty() -> Error:', err);
          return throwError(() => err);
        }),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    }
  }

  @Action(AddCounterparty)
  public createItem(
    { getState, patchState, setState }: StateContext<CounterpartyStateModel>,
    { payload }: AddCounterparty,
  ) {
    patchState({ loading: true });
    return this.itemsSvc.add(removeID(payload)).pipe(
      tap((result: Counterparty) => {
        const state = getState();
        setState({
          ...state,
          items: [result, ...state.items],
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

  @Action(UpdateCounterparty)
  public updateItem(
    { getState, patchState }: StateContext<CounterpartyStateModel>,
    { payload }: UpdateCounterparty,
  ) {
    patchState({ loading: true });
    return this.itemsSvc.update(payload).pipe(
      tap((selected: Counterparty) => {
        const state = getState();
        const items = state.items;
        const idx = items.findIndex((el) => el.id === selected.id);
        if (idx || idx === 0) {
          items[idx] = selected;
        }
        patchState({ selected, items });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteCounterparty)
  public deleteCounterparty(
    { getState, patchState, setState }: StateContext<CounterpartyStateModel>,
    { payload }: DeleteCounterparty,
  ) {
    patchState({ loading: true });
    return this.itemsSvc.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          ...state,
          items,
        });
      }),
      catchError((err) => {
        this.snackBar.open(notifyError(err), '', {
          duration: 4000,
        });
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
