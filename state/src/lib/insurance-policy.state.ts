import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { InsurancePolicyService } from '@services/insurance-policy.service';
import { InsurancePolicy, InsurancePolicyType } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AddItem, DeleteItem, FetchItems, GetItem, UpdateItem } from './insurance-policy.actions';

export interface InsurancePolicyStateModel {
  items: InsurancePolicy[];
  selected: InsurancePolicy;
  loading?: boolean;
  count: number;
}

@State<InsurancePolicyStateModel>({
  name: 'insurance_policy',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class InsurancePolicyState {
  private readonly itemsService = inject(InsurancePolicyService);

  private readonly empty: InsurancePolicy = {
    id: 0,
    type: InsurancePolicyType.ADDITIONAL,
    sum_insured: 0,
    insurance_premium: 0,
    insurance_company_id: null,
    from: null,
    to: null,
    bankruptcy_manager_id: null,
    insurance_attachments: [],
  };

  @Selector()
  public static getLoading(state: InsurancePolicyStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: InsurancePolicyStateModel) {
    return state.selected;
  }

  @Selector()
  public static getCount(state: InsurancePolicyStateModel) {
    return state.count;
  }

  @Selector()
  public static getItems(state: InsurancePolicyStateModel): InsurancePolicy[] {
    return state.items;
  }

  @Action(FetchItems)
  public fetchItems({ getState, setState, patchState }: StateContext<InsurancePolicyStateModel>) {
    // console.log('InsurancePolicyState::FetchItems');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.GetAll().pipe(
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
  public getItem(
    { patchState, getState, setState }: StateContext<InsurancePolicyStateModel>,
    { payload },
  ) {
    // console.log('InsurancePolicyState::GetItem', payload);
    patchState({ loading: true });
    const state = getState();
    if (payload === 0) {
      patchState({ selected: this.empty, loading: false });
    } else {
      const idx = state.items.findIndex(({ id }) => id === payload);
      if (idx >= 0) {
        const selected = state.items[idx];
        selected.from = new Date(selected.from);
        selected.to = new Date(selected.to);
        patchState({ selected, loading: false });
      } else {
        return this.itemsService.get(payload).pipe(
          tap((selected) => {
            selected.from = new Date(selected.from);
            selected.to = new Date(selected.to);
            setState({
              ...state,
              selected,
            });
          }),
          catchError((err) => throwError(() => err)),
          finalize(() => patchState({ loading: false })),
        );
      }
    }
  }

  @Action(AddItem)
  public createItem(
    { getState, patchState, setState }: StateContext<InsurancePolicyStateModel>,
    { payload },
  ) {
    // console.log('InsurancePolicyState::AddItem', payload);
    patchState({ loading: true });
    delete payload.debtor;
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
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, setState, patchState }: StateContext<InsurancePolicyStateModel>,
    { payload },
  ) {
    // console.log('InsurancePolicyState::UpdateItem', payload);
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
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<InsurancePolicyStateModel>,
    { payload },
  ) {
    // console.log('InsurancePolicyState::DeleteItem', payload);
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
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
