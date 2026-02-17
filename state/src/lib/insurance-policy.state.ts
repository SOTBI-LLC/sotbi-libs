import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { InsurancePolicyService } from '@sotbi/data-access';
import { InsurancePolicy } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddInsurancePolicy,
  DeleteInsurancePolicy,
  FetchInsurancePolicies,
  GetInsurancePolicy,
  UpdateInsurancePolicy,
} from './insurance-policy.actions';

export class InsurancePolicyStateModel {
  public items: InsurancePolicy[] = [];
  public selected: InsurancePolicy | null = null;
  public loading = false;
  public count = 0;
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

  private readonly empty = new InsurancePolicy();

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

  @Action(FetchInsurancePolicies)
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<InsurancePolicyStateModel>) {
    // console.log('InsurancePolicyState::FetchItems');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      this.itemsService.GetAll().pipe(
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

  @Action(GetInsurancePolicy)
  public getItem(
    { patchState, getState, setState }: StateContext<InsurancePolicyStateModel>,
    { payload }: GetInsurancePolicy,
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
        if (selected.from) {
          selected.from = new Date(selected.from);
        }
        if (selected.to) {
          selected.to = new Date(selected.to);
        }
        patchState({ selected, loading: false });
      } else {
        this.itemsService.get(payload).pipe(
          tap((selected) => {
            if (selected.from) {
              selected.from = new Date(selected.from);
            }
            if (selected.to) {
              selected.to = new Date(selected.to);
            }
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

  @Action(AddInsurancePolicy)
  public createItem(
    { getState, patchState, setState }: StateContext<InsurancePolicyStateModel>,
    { payload }: AddInsurancePolicy,
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

  @Action(UpdateInsurancePolicy)
  public updateItem(
    { getState, setState, patchState }: StateContext<InsurancePolicyStateModel>,
    { payload }: UpdateInsurancePolicy,
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

  @Action(DeleteInsurancePolicy)
  public deleteItem(
    { getState, patchState, setState }: StateContext<InsurancePolicyStateModel>,
    { payload }: DeleteInsurancePolicy,
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
