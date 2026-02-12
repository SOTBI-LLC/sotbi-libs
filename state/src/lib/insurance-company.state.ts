import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { InsuranceCompanyService } from '@services/insurance-company.service';
import { getDiff } from '@shared/shared-globals';
import type { InsuranceCompany } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddCompany,
  AddPolicy,
  DeleteCompany,
  DeletePolicy,
  FetchCompanies,
  GetCompany,
  UpdateCompany,
  UpdatePolicy,
} from './insurance-company.actions';

export class InsuranceCompanyStateModel {
  items: InsuranceCompany[] = [];
  selected: InsuranceCompany = { id: 0, name: null, inn: null };
  loading = false;
  count = 0;
}

@State<InsuranceCompanyStateModel>({
  name: 'insurance_company',
  defaults: {
    items: [],
    loading: false,
    selected: { id: 0, name: null, inn: null },
    count: 0,
  },
})
@Injectable()
export class InsuranceCompanyState {
  private readonly itemsService = inject(InsuranceCompanyService);

  private readonly empty: InsuranceCompany = { id: 0, name: null, inn: null };

  @Selector()
  public static getLoading(state: InsuranceCompanyStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: InsuranceCompanyStateModel) {
    return state.selected;
  }

  @Selector()
  public static getCount(state: InsuranceCompanyStateModel) {
    return state.count;
  }

  @Selector()
  public static getItems(
    state: InsuranceCompanyStateModel,
  ): InsuranceCompany[] {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<InsuranceCompanyStateModel>) {
    dispatch(new FetchCompanies());
  }

  @Action(FetchCompanies)
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<InsuranceCompanyStateModel>) {
    // console.log('InsuranceCompanyState::FetchItems');
    const state = getState();
    patchState({ loading: true });
    return this.itemsService.getAll().pipe(
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

  @Action(GetCompany)
  public getItem(
    {
      patchState,
      getState,
      setState,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::GetItem', payload);
    patchState({ loading: true });
    const state = getState();
    if (payload > 0) {
      const idx = state.items.findIndex(({ id }) => id === payload);
      if (idx >= 0) {
        patchState({ selected: state.items[idx], loading: false });
      } else {
        return this.itemsService.get(payload).pipe(
          tap((item) => {
            setState({
              ...state,
              selected: item,
            });
          }),
          catchError((err) => throwError(err)),
          finalize(() => patchState({ loading: false })),
        );
      }
    } else {
      patchState({ selected: this.empty, loading: false });
    }
  }

  @Action(AddCompany)
  public createItem(
    {
      getState,
      patchState,
      setState,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::AddItem', payload);
    patchState({ loading: true });
    return this.itemsService.create(payload).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, result],
          count: state.count++,
          selected: result,
        });
      }),
      catchError((err) => throwError(err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateCompany)
  public updateItem(
    {
      getState,
      setState,
      patchState,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    const { changed, update } = getDiff(state.selected, payload);
    if (changed) {
      update.id = payload.id;
      return this.itemsService.update(update).pipe(
        tap((selected) => {
          const idx = state.items.findIndex(({ id }) => id === selected.id);
          state.items[idx] = selected;
          setState({
            ...state,
            selected,
            items: state.items,
          });
        }),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(UpdatePolicy)
  public updatePolicy(
    {
      getState,
      patchState,
      dispatch,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::UpdatePolicy', payload);
    patchState({ loading: true });
    const state = getState();
    if (state.selected?.insurance_policies.length > 0) {
      const idx = state.selected?.insurance_policies.findIndex(
        (el) => el.id === payload.id,
      );
      state.selected.insurance_policies[idx] = payload;
    } else {
      return dispatch(new AddPolicy(payload));
    }
    patchState({ selected: state.selected, loading: false });
  }

  @Action(DeletePolicy)
  public deletePolicy(
    { getState, patchState }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::UpdatePolicy', payload);
    patchState({ loading: true });
    const state = getState();
    const selected = state.selected;
    const idx = selected.insurance_policies.findIndex(
      (el) => el.id === payload,
    );
    selected.insurance_policies.splice(idx, 1);
    patchState({ selected, loading: false });
  }

  @Action(AddPolicy)
  public addPolicy(
    { getState, patchState }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::AddPolicy', payload);
    patchState({ loading: true });
    const state = getState();
    const selected = structuredClone(state.selected);
    selected.insurance_policies.push(payload);
    patchState({ selected, loading: false });
  }

  @Action(DeleteCompany)
  public deleteItem(
    {
      getState,
      patchState,
      setState,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload },
  ) {
    // console.log('InsuranceCompanyState::DeleteItem', payload);
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          items,
          ...state,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
