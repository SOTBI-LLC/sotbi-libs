import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { BankruptcyService } from '@services/bankruptcy.service';
import { bankruptcyManagerFormatter, getDiff } from '@shared/shared-globals';
import { Bankruptcy, PostAddress } from '@sotbi/models';
import { itemMap } from '@store/simple-edit.state.model';
import { clone } from 'ramda';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddPolicy,
  ClearSelectedBankruptcy,
  CreateBankruptcy,
  DeleteBankruptcy,
  DeletePolicy,
  FetchBankruptcies,
  GetBankruptcy,
  UpdateBankruptcy,
  UpdatePolicy,
} from './bankruptcy.actions';

const emptyPostAddress: PostAddress = {
  id: 0,
  name: '',
  default: false,
  type: '',
};

export class BankruptcyStateModel {
  public items: Bankruptcy[] = [];
  public selected: Bankruptcy | null = null;
  public count: number = 0;
  public loading: boolean = false;
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

  private readonly empty: Bankruptcy = {
    id: 0,
    name: '',
    surname: null,
    patronymicname: null,
    inn: null,
    snils: null,
    post_addresses: [emptyPostAddress], // null,
    uri: null,
    insurance_policies: [],
    deleted_at: null,
    sro: null,
    sro_id: null,
    show: null,
  };

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
  public static getItem(state: BankruptcyStateModel): Bankruptcy {
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
  public fetchBankruptcies({ patchState, getState }: StateContext<BankruptcyStateModel>) {
    patchState({ loading: true });
    const state = getState();
    if (!(state.items.length && state.loading)) {
      return this.itemsService.getAll().pipe(
        tap((res) => {
          const maps = new Map(
            res.map((i): [number, string] => [i.id, bankruptcyManagerFormatter(i)]),
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
  }

  @Action(GetBankruptcy)
  public getBankruptcy({ patchState }: StateContext<BankruptcyStateModel>, { payload }) {
    // console.log('BankruptcyState::FetchBankruptcies', payload);
    patchState({ loading: true });
    if (payload === 0) {
      return patchState({ loading: false, selected: Object.assign({}, this.empty) });
    }
    return this.itemsService.get(payload).pipe(
      tap((selected: Bankruptcy) => {
        patchState({ selected });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(CreateBankruptcy)
  public createBankruptcy(
    { getState, patchState, setState }: StateContext<BankruptcyStateModel>,
    { payload },
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
    { payload },
  ) {
    patchState({ loading: true });
    const state = getState();
    const { changed, update } = getDiff(state.selected, payload);
    const { id } = payload;
    if (changed) {
      // удаляем основные и дополнительные страховки, так как на бэке они не обрабатываются
      delete update?.primary;
      delete update?.additional;
      return this.itemsService.save(update, id).pipe(
        tap((selected) => {
          patchState({
            items: state.items.map((el) => (el.id === selected.id ? selected : el)),
            selected,
          });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    }
  }

  @Action(ClearSelectedBankruptcy)
  public clearSelectedBankruptcy({ patchState }: StateContext<BankruptcyStateModel>) {
    patchState({ selected: null });
  }

  @Action(DeleteBankruptcy)
  public deleteBankruptcy(
    { getState, patchState, setState }: StateContext<BankruptcyStateModel>,
    { payload },
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

  @Action(UpdatePolicy)
  public updatePolicy(
    { getState, patchState, dispatch }: StateContext<BankruptcyStateModel>,
    { payload },
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = clone(state.selected);
    if (state.selected.insurance_policies.length > 0) {
      const idx = selected.insurance_policies.findIndex((el) => el.id === payload.id);
      selected.insurance_policies[idx] = payload;
    } else {
      return dispatch(new AddPolicy(payload));
    }
    patchState({ selected, loading: false });
  }

  @Action(AddPolicy)
  public addPolicy({ getState, patchState }: StateContext<BankruptcyStateModel>, { payload }) {
    patchState({ loading: true });
    const state = getState();
    const selected = clone(state.selected);
    selected.insurance_policies.push(payload);
    patchState({ selected, loading: false });
  }

  @Action(DeletePolicy)
  public deletePolicy({ getState, patchState }: StateContext<BankruptcyStateModel>, { payload }) {
    patchState({ loading: true });
    const state = getState();
    const selected = clone(state.selected);
    const idx = selected.insurance_policies.findIndex((el) => el.id === payload);
    selected.insurance_policies.splice(idx, 1);
    patchState({ selected, loading: false });
  }
}
