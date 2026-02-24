import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { DebtorService } from '@sotbi/data-access';
import type { Debtor, DebtorsList, InsurancePolicy } from '@sotbi/models';
import { conditionMap } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';
import { bankruptcyManagerFormatter, deepEqual } from '@sotbi/utils';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import {
  AddDebtor,
  AddDebtorPolicy,
  ClearSelectedDebtor,
  DeleteDebtorItem,
  DeleteDebtorPolicy,
  FetchDebtors,
  FetchDebtorsPage,
  FetchProjectsAndDebtors,
  GetDebtor,
  RestoreDebtor,
  UpdateDebtorItem,
  UpdateDebtorPolicy,
} from './debtors.actions';
import type { itemMap } from './simple-edit.state.model';

/** не используется */
@Injectable({ providedIn: 'root' })
export class UniqueDebtorINNValidator implements AsyncValidator {
  private readonly debtorSrv = inject(DebtorService);

  public validate(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.dirty && (ctrl.value.length === 10 || ctrl.value.length === 12)) {
      return this.debtorSrv.checkInn(ctrl.value).pipe(
        map((res: number[]) =>
          res && res.length > 0 ? { uniqueDebtorError: true } : null,
        ),
        catchError((err) => {
          console.error(err);
          return of(null);
        }),
      );
    } else {
      return of(null);
    }
  }
}

export class DebtorStateModel {
  public debtors: DebtorsList[] = [];
  public selected: Debtor | null = null;
  public count = 0;
  public loading = false;
  public projectsAndDebtors: Debtor[] = [];
  public filter?: {
    name: string;
  };
  public map: itemMap = new Map();
}

@State<DebtorStateModel>({
  name: 'debtors',
  defaults: {
    debtors: [],
    selected: null,
    count: 0,
    loading: false,
    projectsAndDebtors: [],
    map: new Map(),
  },
})
@Injectable()
export class DebtorsState {
  private readonly debtorSrv = inject(DebtorService);
  private uniqueDebtor = inject(UniqueDebtorINNValidator);
  private readonly snackBar = inject(MatSnackBar);

  @Selector()
  public static getLoading(state: DebtorStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getDebtors(state: DebtorStateModel): DebtorsList[] {
    return state.debtors;
  }

  @Selector()
  public static getDebtor(state: DebtorStateModel): Debtor | null {
    return state.selected;
  }

  @Selector()
  public static getSelected(state: DebtorStateModel): number {
    return state.selected?.id ?? 0;
  }

  @Selector()
  public static getCount(state: DebtorStateModel): number {
    return state.count;
  }

  @Selector()
  public static getProjectsAndDebtors(state: DebtorStateModel): Debtor[] {
    return state.projectsAndDebtors;
  }

  @Selector()
  public static getDebtorMap(state: DebtorStateModel): itemMap {
    return state.map;
  }

  public static debtorConvertFunction(
    debtor: Partial<Debtor> = {},
  ): DebtorsList | null {
    if (debtor) {
      return {
        id: debtor.id,
        category_name: debtor.category?.name ?? '',
        project_created_at: debtor.project?.created_at ?? null,
        debtor_created_at: debtor.created_at ?? null,
        deposit: debtor.deposit,
        kpp: debtor.kpp,
        address: debtor.address,
        post_address: debtor.post_address,
        arbitration_name: debtor.arbitration?.name,
        case_no: debtor.case_no,
        decision_date: debtor.decision_date,
        bankruptcy_name:
          debtor.bankruptcy_manager &&
          bankruptcyManagerFormatter(debtor.bankruptcy_manager),
        sro: debtor.bankruptcy_manager?.sro?.name,
        deposit_share: debtor.deposit_share,
        full_name: debtor.full_name,
        group1: debtor.project?.group?.user?.user,
        group2: debtor.project?.manager?.user?.user,
        inn: debtor.inn,
        kind: debtor.kind ? 'физ.лицо' : 'юр.лицо',
        koordinator: debtor.project?.department?.user?.user,
        name: debtor.name,
        not_deposit: debtor.not_deposit,
        not_deposit_share: debtor.not_deposit_share,
        ogrn: debtor.ogrn,
        procedure_name: debtor.procedure?.name,
        project_id: debtor.project?.id,
        project_name: debtor.project?.name,
        registry: debtor.registry,
        reportable: debtor.reportable ? 'да' : 'нет',
        state: conditionMap.get(debtor.project?.condition ?? '') ?? '',
        links: debtor.links,
        contacts: debtor.contacts,
      } as DebtorsList;
    }
    return null;
  }

  public static prepForSave(
    old: Debtor,
    current: Debtor,
    nullables: Set<string>,
  ): WithId<Debtor> | null {
    const update: Record<string, unknown> = { id: old.id };
    for (const prop in current) {
      const key = prop as keyof Debtor;
      if (Object.prototype.hasOwnProperty.call(current, prop)) {
        if (old.id === 0 && current[key] === null) {
          continue;
        }
        if (nullables.has(prop)) {
          continue;
        }
        if (Array.isArray(current[key])) {
          if (!deepEqual(old[key], current[key])) {
            if (
              current[key].length > 0 &&
              Object.prototype.hasOwnProperty.call(current[key][0], 'type') &&
              !(
                typeof current[key][0].type === 'number' ||
                typeof current[key][0].type === 'boolean'
              )
            ) {
              update[key] = current[key].map((el) => {
                delete el.type;
                return el;
              });
            } else {
              update[key] = current[key];
            }
          }
        } else if (old[key] !== current[key]) {
          update[key] = current[key];
        }
      }
    }
    if (Object.entries(update).length > 1) {
      return update as WithId<Debtor>;
    }
    return null;
  }

  @Action(FetchProjectsAndDebtors, { cancelUncompleted: false })
  public fetchProjectsAndDebtors({
    getState,
    patchState,
  }: StateContext<DebtorStateModel>) {
    const state = getState();
    if (!state.loading && state.projectsAndDebtors.length === 0) {
      patchState({ loading: true });
      return this.debtorSrv.getListAsProject().pipe(
        tap((res) => {
          patchState({ projectsAndDebtors: res });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    }
    return;
  }

  @Action(FetchDebtors, { cancelUncompleted: false })
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<DebtorStateModel>) {
    const state = getState();
    if (!state.loading && !state.debtors.length) {
      patchState({ loading: true });
      return this.debtorSrv
        .getAllWithParams(new HttpParams().set('limit', '-1'))
        .pipe(
          tap(({ debtors, count }) => {
            const map = new Map(
              debtors.map((i): [number, string] => [i.id, i.name]),
            );
            setState({
              ...state,
              debtors,
              count,
              map,
            });
          }),
          catchError((err) => {
            console.error(err.message);
            return throwError(() => err);
          }),
          finalize(() => {
            patchState({ loading: false });
          }),
        );
    }
    return;
  }

  @Action(FetchDebtorsPage, { cancelUncompleted: true })
  public fetchPage(
    { getState, setState }: StateContext<DebtorStateModel>,
    { payload }: FetchDebtorsPage,
  ) {
    console.log('DebtorsState::FetchPage', getState().debtors.length);
    return this.debtorSrv
      .getAllWithParams(
        new HttpParams()
          .set('limit', payload.limit.toString())
          .set('from', payload.from.toString()),
      )
      .pipe(
        tap(({ debtors, count }) => {
          const state = getState();
          setState({
            ...state,
            debtors: [...state.debtors, ...debtors],
            count,
          });
        }),
        catchError((err) => {
          console.error(err.message);
          return throwError(() => err);
        }),
      );
  }

  @Action(GetDebtor, { cancelUncompleted: true })
  public getItem(
    { setState, getState }: StateContext<DebtorStateModel>,
    { payload }: GetDebtor,
  ) {
    if (payload === 0) {
      return;
    } else {
      const state = getState();
      if (
        (!state.loading && !state.selected) ||
        (state.selected && payload !== state.selected.id)
      ) {
        return this.debtorSrv.get(payload).pipe(
          tap((selected) => {
            setState({ ...state, selected });
          }),
          catchError((err) => {
            console.error(err.message);
            return throwError(() => err);
          }),
        );
      }
    }
    return;
  }

  @Action(ClearSelectedDebtor)
  public clearSelected({ patchState }: StateContext<DebtorStateModel>) {
    return patchState({ selected: null });
  }

  @Action(AddDebtor)
  public addItem(
    { getState, patchState }: StateContext<DebtorStateModel>,
    { payload }: AddDebtor,
  ) {
    patchState({ loading: true });
    return this.debtorSrv.add(payload).pipe(
      tap((selected: Debtor) => {
        const debtor = DebtorsState.debtorConvertFunction(selected);
        if (debtor) {
          patchState({ selected, debtors: [debtor, ...getState().debtors] });
        }
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateDebtorItem)
  public updateItem(
    { patchState, getState, setState }: StateContext<DebtorStateModel>,
    { payload }: UpdateDebtorItem,
  ) {
    patchState({ loading: true });
    const state = getState();
    const debtors = [...state.debtors];
    return this.debtorSrv.update(payload).pipe(
      tap((selected) => {
        const idx = debtors.findIndex((el) => el.id === selected.id);
        const debtor = DebtorsState.debtorConvertFunction(selected);
        if (idx && debtor) {
          debtors[idx] = debtor;
        }
        setState({
          ...state,
          selected,
          debtors,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteDebtorItem)
  public deleteItem(
    { getState, patchState, dispatch }: StateContext<DebtorStateModel>,
    { payload }: DeleteDebtorItem,
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.debtorSrv.delete(payload).pipe(
      tap(() => {
        const snackBarRef = this.snackBar.open(
          `Должник успешно удален`,
          'Отменить',
          {
            duration: 10000,
          },
        );
        patchState({
          debtors: state.debtors.filter(({ id }) => id !== payload),
          count: state.count--,
          selected: null,
          loading: false,
        });
        snackBarRef
          .onAction()
          .pipe(take(1))
          .subscribe(() => {
            dispatch(new RestoreDebtor(payload));
          });
      }),
      catchError((error) => {
        console.error(error.message);
        this.snackBar.open(error.message);
        return throwError(() => error);
      }),
    );
  }

  @Action(RestoreDebtor)
  public restoreItem(
    { getState, patchState, setState }: StateContext<DebtorStateModel>,
    { payload }: RestoreDebtor,
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.debtorSrv.restore(payload).pipe(
      tap(() => {
        setState({
          ...state,
          count: state.count++,
        });
      }),
      catchError((error) => {
        console.error(error.message);
        this.snackBar.open(error.message);
        return throwError(() => error);
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(UpdateDebtorPolicy)
  public updatePolicy(
    { getState, patchState, dispatch }: StateContext<DebtorStateModel>,
    { payload }: UpdateDebtorPolicy,
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.selected;
    if (selected?.insurance_policies) {
      const idx = selected.insurance_policies.findIndex(
        (el) => el.id === payload.id,
      );
      selected.insurance_policies[idx] = payload as InsurancePolicy;
      patchState({ selected, loading: false });
    } else {
      dispatch(new AddDebtorPolicy(payload));
    }
  }

  @Action(AddDebtorPolicy)
  public addPolicy(
    { getState, patchState, setState }: StateContext<DebtorStateModel>,
    { payload }: AddDebtorPolicy,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (state.selected) {
      const selected = structuredClone(state.selected);
      selected.insurance_policies?.push(payload as InsurancePolicy);
      setState({ ...state, selected, loading: false });
    }
  }

  @Action(DeleteDebtorPolicy)
  public deletePolicy(
    { getState, patchState }: StateContext<DebtorStateModel>,
    { payload }: DeleteDebtorPolicy,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (state.selected) {
      const selected = structuredClone(state.selected);
      const idx = selected.insurance_policies?.findIndex(
        (el) => el.id === payload,
      );
      if (idx) {
        selected.insurance_policies?.splice(idx, 1);
      }
      patchState({ selected, loading: false });
    }
  }
}
