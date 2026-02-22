import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { BankruptcyService } from '@sotbi/data-access';
import type { InsurancePolicy, PostAddress } from '@sotbi/models';
import { Bankruptcy } from '@sotbi/models';
import { bankruptcyManagerFormatter, getDiff } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddBankruptcyPolicy,
  ClearSelectedBankruptcy,
  CreateBankruptcy,
  DeleteBankruptcy,
  DeleteBankruptcyPolicy,
  FetchBankruptcies,
  GetBankruptcy,
  UpdateBankruptcy,
  UpdateBankruptcyPolicy,
} from './bankruptcy.actions';
import type { itemMap } from './simple-edit.state.model';

const emptyPostAddress: PostAddress = {
  id: 0,
  name: '',
  default: false,
  type: '',
};

export class BankruptcyStateModel {
  public items: Bankruptcy[] = [];
  public selected: Bankruptcy | null = null;
  public count = 0;
  public loading = false;
  public map: itemMap = new Map();
}

@State<BankruptcyStateModel>({
  name: 'bankruptcies',
  defaults: {
    items: [],
    selected: null,
    count: 0,
    loading: false,
    map: new Map(),
  },
})
@Injectable()
export class BankruptcyState implements NgxsOnInit {
  private readonly itemsService = inject(BankruptcyService);

  private readonly empty: Bankruptcy = new Bankruptcy({
    post_addresses: [emptyPostAddress],
  });

  @Selector()
  public static loading(state: BankruptcyStateModel) {
    return state.loading;
  }

  @Selector()
  public static getItems(state: BankruptcyStateModel) {
    return state.items;
  }

  @Selector()
  public static getMapItems(state: BankruptcyStateModel): itemMap {
    return state.map;
  }

  @Selector()
  public static getItem(state: BankruptcyStateModel): Bankruptcy | null {
    return state.selected;
  }

  @Selector()
  public static getCount(state: BankruptcyStateModel) {
    return state.count;
  }

  public ngxsOnInit({ dispatch }: StateContext<BankruptcyStateModel>) {
    dispatch(new FetchBankruptcies());
  }

  @Action(FetchBankruptcies)
  public fetchBankruptcies({
    patchState,
    getState,
  }: StateContext<BankruptcyStateModel>) {
    // console.log('BankruptcyState::FetchBankruptcies');
    const state = getState();
    if (!(state.items.length && state.loading)) {
      patchState({ loading: true });
      return this.itemsService.getAll().pipe(
        tap((res) => {
          const maps = new Map(
            res.map((i): [number, string] => [
              i.id ?? 0,
              bankruptcyManagerFormatter(i),
            ]),
          );
          res = res.map((el) => {
            el.show = bankruptcyManagerFormatter(el);
            return el;
          });
          patchState({ items: res, count: res.length, map: maps });
          return res;
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
    }
    return of();
  }

  @Action(GetBankruptcy)
  public getBankruptcy(
    { patchState, setState, getState }: StateContext<BankruptcyStateModel>,
    { payload }: GetBankruptcy,
  ) {
    // console.log('BankruptcyState::GetBankruptcy', payload);
    patchState({ loading: true });
    if (payload === 0) {
      return patchState({
        loading: false,
        selected: Object.assign({}, this.empty),
      });
    }
    const state = getState();
    return this.itemsService.get(payload).pipe(
      tap((selected: Bankruptcy) => {
        setState({ ...state, selected, loading: false });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(CreateBankruptcy)
  public createBankruptcy(
    { getState, patchState, setState }: StateContext<BankruptcyStateModel>,
    { payload }: CreateBankruptcy,
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

  @Action(UpdateBankruptcy)
  public updateBankruptcy(
    { getState, patchState }: StateContext<BankruptcyStateModel>,
    { payload }: UpdateBankruptcy,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (!state.selected) {
      patchState({ loading: false });
      return;
    }
    const { changed, update } = getDiff<Bankruptcy>(state.selected, payload);
    const { id } = payload;
    if (changed && update) {
      const updatePayload = update as Partial<Bankruptcy> & {
        primary?: unknown;
        additional?: unknown;
      };
      // удаляем основные и дополнительные страховки, так как на бэке они не обрабатываются
      delete updatePayload.primary;
      delete updatePayload.additional;
      return this.itemsService.save(updatePayload, id ?? 0).pipe(
        tap((selected) => {
          patchState({
            items: state.items.map((el) =>
              el.id === selected.id ? selected : el,
            ),
            selected,
          });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    }
    return;
  }

  @Action(ClearSelectedBankruptcy)
  public clearSelectedBankruptcy({
    patchState,
  }: StateContext<BankruptcyStateModel>) {
    patchState({ selected: null });
  }

  @Action(DeleteBankruptcy)
  public deleteBankruptcy(
    { getState, patchState, setState }: StateContext<BankruptcyStateModel>,
    { payload }: DeleteBankruptcy,
  ) {
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
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

  @Action(UpdateBankruptcyPolicy)
  public updatePolicy(
    { getState, patchState, dispatch }: StateContext<BankruptcyStateModel>,
    { payload }: UpdateBankruptcyPolicy,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (!state.selected) {
      patchState({ loading: false });
      return;
    }
    const selected = structuredClone(state.selected);
    if (state.selected.insurance_policies.length > 0) {
      const idx = selected.insurance_policies.findIndex(
        ({ id }: InsurancePolicy) => id === payload.id,
      );
      selected.insurance_policies[idx] = payload;
    } else {
      return dispatch(new AddBankruptcyPolicy(payload));
    }
    return patchState({ selected, loading: false });
  }

  @Action(AddBankruptcyPolicy)
  public addPolicy(
    { getState, patchState }: StateContext<BankruptcyStateModel>,
    { payload }: AddBankruptcyPolicy,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (!state.selected) {
      patchState({ loading: false });
      return;
    }
    const selected = structuredClone(state.selected);
    selected.insurance_policies.push(payload);
    patchState({ selected, loading: false });
  }

  @Action(DeleteBankruptcyPolicy)
  public deletePolicy(
    { getState, patchState }: StateContext<BankruptcyStateModel>,
    { payload }: DeleteBankruptcyPolicy,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (!state.selected) {
      patchState({ loading: false });
      return;
    }
    const selected = structuredClone(state.selected);
    const idx = selected.insurance_policies.findIndex(
      ({ id }: InsurancePolicy) => id === payload,
    );
    selected.insurance_policies.splice(idx, 1);
    patchState({ selected, loading: false });
  }
}
