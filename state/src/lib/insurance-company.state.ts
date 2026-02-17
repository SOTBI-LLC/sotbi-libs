import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { InsuranceCompanyService } from '@sotbi/data-access';
import { InsuranceCompany } from '@sotbi/models';
import { getDiff } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddCompany,
  AddInsurancePolicy,
  DeleteCompany,
  DeleteInsurancePolicy,
  FetchCompanies,
  GetCompany,
  UpdateCompany,
  UpdateInsurancePolicy,
} from './insurance-company.actions';

export class InsuranceCompanyStateModel {
  public items: InsuranceCompany[] = [];
  public selected: InsuranceCompany | null = null;
  public loading = false;
  public count = 0;
}

@State<InsuranceCompanyStateModel>({
  name: 'insurance_company',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class InsuranceCompanyState {
  private readonly itemsService = inject(InsuranceCompanyService);

  private readonly empty: InsuranceCompany = new InsuranceCompany();

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
    { payload }: GetCompany,
  ) {
    // console.log('InsuranceCompanyState::GetItem', payload);
    patchState({ loading: true });
    const state = getState();
    if (payload > 0) {
      const idx = state.items.findIndex(({ id }) => id === payload);
      if (idx >= 0) {
        patchState({ selected: state.items[idx], loading: false });
      } else {
        this.itemsService.get(payload).pipe(
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
    { payload }: AddCompany,
  ) {
    // console.log('InsuranceCompanyState::AddItem', payload);
    patchState({ loading: true });
    this.itemsService.create(payload).pipe(
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
    { payload }: UpdateCompany,
  ) {
    // console.log('InsuranceCompanyState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    if (state.selected) {
      const { changed, update } = getDiff<InsuranceCompany>(
        state.selected,
        payload,
      );
      if (changed && update) {
        update.id = payload.id;
        this.itemsService.update(update).pipe(
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
  }

  @Action(UpdateInsurancePolicy)
  public updatePolicy(
    {
      getState,
      patchState,
      dispatch,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload }: UpdateInsurancePolicy,
  ) {
    // console.log('InsuranceCompanyState::UpdatePolicy', payload);
    patchState({ loading: true });
    const state = getState();
    if (state.selected) {
      const selected = structuredClone(state.selected);
      if (selected.insurance_policies?.length > 0) {
        const idx = selected.insurance_policies.findIndex(
          (el) => el.id === payload.id,
        );
        if (idx >= 0) {
          selected.insurance_policies[idx] = payload;
        }
      } else {
        dispatch(new AddInsurancePolicy(payload));
      }
      patchState({ selected, loading: false });
    }
  }

  @Action(DeleteInsurancePolicy)
  public deletePolicy(
    { getState, patchState }: StateContext<InsuranceCompanyStateModel>,
    { payload }: DeleteInsurancePolicy,
  ) {
    // console.log('InsuranceCompanyState::UpdatePolicy', payload);
    patchState({ loading: true });
    const state = getState();
    if (state.selected) {
      const selected = structuredClone(state.selected);
      const idx = selected.insurance_policies.findIndex(
        (el) => el.id === payload,
      );
      selected.insurance_policies.splice(idx, 1);
      patchState({ selected, loading: false });
    }
  }

  @Action(AddInsurancePolicy)
  public addPolicy(
    { getState, patchState }: StateContext<InsuranceCompanyStateModel>,
    { payload }: AddInsurancePolicy,
  ) {
    // console.log('InsuranceCompanyState::AddPolicy', payload);
    patchState({ loading: true });
    const state = getState();
    if (state.selected) {
      const selected = structuredClone(state.selected);
      selected.insurance_policies.push(payload);
      patchState({ selected, loading: false });
    }
  }

  @Action(DeleteCompany)
  public deleteItem(
    {
      getState,
      patchState,
      setState,
    }: StateContext<InsuranceCompanyStateModel>,
    { payload }: DeleteCompany,
  ) {
    // console.log('InsuranceCompanyState::DeleteItem', payload);
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
