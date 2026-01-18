import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { INNValidator, OGRNValidator } from '@root/counterparty/edit/edit.common';
import { DebtorService } from '@services/debtor.service';
import { bankruptcyManagerFormatter, insurancePolicyArray } from '@shared/shared-globals';
import { AccountStatement, conditionMap, Debtor, DebtorsList, Project } from '@sotbi/models';
import { itemMap } from '@store/simple-edit.state.model';
import { clone, equals } from 'ramda';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AddDebtorPolicy,
  AddItem,
  ClearSelected,
  DeleteDebtorPolicy,
  DeleteItem,
  FetchDebtors,
  FetchPage,
  FetchProjectsAndDebtors,
  GetDebtor,
  RestoreItem,
  UpdateDebtorPolicy,
  UpdateItem,
} from './debtors.actions';

@Injectable({ providedIn: 'root' })
export class UniqueDebtorINNValidator implements AsyncValidator {
  private readonly debtorSrv = inject(DebtorService);

  public validate(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.dirty && (ctrl.value.length === 10 || ctrl.value.length === 12)) {
      return this.debtorSrv.checkInn(ctrl.value).pipe(
        map((res: number[]) => (res && res.length > 0 ? { uniqueDebtorError: true } : null)),
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
  public selected: Debtor;
  public count: number = 0;
  public loading: boolean = false;
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
  public static getDebtor(state: DebtorStateModel): Debtor {
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

  public static debtorConvertFunction(debtor: Partial<Debtor> = {}): DebtorsList | null {
    if (debtor) {
      return {
        id: debtor.id,
        category_name: debtor.category?.name || '',
        project_created_at: debtor.project?.created_at || null,
        debtor_created_at: debtor.created_at || null,
        deposit: debtor.deposit,
        kpp: debtor.kpp,
        address: debtor.address,
        post_address: debtor.post_address,
        arbitration_name: debtor.arbitration?.name,
        case_no: debtor.case_no,
        decision_date: debtor.decision_date,
        bankruptcy_name:
          debtor.bankruptcy_manager && bankruptcyManagerFormatter(debtor.bankruptcy_manager),
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
        state: conditionMap.get(debtor.project?.condition),
        links: debtor.links,
        contacts: debtor.contacts,
      };
    }
    return null;
  }

  public static initDebtorFormGroup(debtor: Partial<Debtor> = { id: 0 }): FormGroup {
    if (debtor == null) {
      debtor = { id: 0 };
    }
    const bankDetails: FormArray = new FormArray([]);
    const links: FormArray = new FormArray([]);
    const properties: FormArray = new FormArray([]);
    // const assets: FormArray = new FormArray([]);
    const { primary, additional } = insurancePolicyArray(debtor);
    if (debtor?.bank_details) {
      for (const bankDetail of debtor.bank_details) {
        const fg = new FormGroup({
          id: new FormControl<number>(bankDetail.id),
          debtor_id: new FormControl<number>(bankDetail.debtor_id),
          name: new FormControl<string>(bankDetail.name),
          bank_account: new FormControl<string>(bankDetail.bank_account, [
            Validators.minLength(20),
            Validators.required,
            Validators.maxLength(20),
            Validators.pattern('^([0-9]{20})$'),
          ]),
          bik: new FormControl<string>(bankDetail.bik, [
            Validators.required,
            Validators.minLength(9),
            Validators.maxLength(9),
            Validators.pattern('^([0-9]{9})$'),
          ]),
          bank: new FormControl<string>(bankDetail.bank),
          corr_account: new FormControl<string>(bankDetail.corr_account, [
            Validators.minLength(20),
            Validators.maxLength(20),
            Validators.pattern('^([0-9]{20})$'),
          ]),
          city: new FormControl<string>(bankDetail.city),
          location: new FormControl<string>(bankDetail.location),
          account_type_id: new FormControl<number>(bankDetail.account_type_id),
          open_date: new FormControl<Date | null>(bankDetail.open_date),
          close_date: new FormControl<Date | null>(bankDetail.close_date),
          final_balance: new FormControl<number>(
            bankDetail?.remainings
              ? bankDetail?.remainings[0]?.final_balance
              : bankDetail?.final_balance,
          ),
          end_date: new FormControl<Date>(
            bankDetail?.remainings ? bankDetail?.remainings[0]?.end_date : bankDetail?.end_date,
          ),
          file_created_at: new FormControl<Date>(bankDetail.file_created_at),
          has_client_bank: new FormControl<boolean>(bankDetail.has_client_bank),
          account_statement_requests: new FormControl<AccountStatement[]>(
            bankDetail.account_statement_requests ? bankDetail.account_statement_requests : null,
          ),
          payment_request: new FormControl(
            bankDetail.payment_request ? bankDetail.payment_request : null,
          ),
        });
        bankDetails.push(fg);
      }
    }
    if (debtor?.links) {
      for (const link of debtor.links) {
        const fg = new FormGroup({
          id: new FormControl<number>(link.id),
          debtor_id: new FormControl<number>(link.debtor_id),
          type: new FormControl(link.type),
          type_id: new FormControl<number>(link.type_id, Validators.required),
          uri: new FormControl<string>(link.uri, Validators.required),
        });
        links.push(fg);
      }
    }
    if (!debtor?.properties && environment.production) {
      debtor.properties = [];
      debtor.properties.push({ id: 0, debtor_id: debtor.id, type: false, description: ' ' });
    }
    if (debtor?.properties) {
      for (const property of debtor.properties) {
        const fg = new FormGroup({
          id: new FormControl<number>(property.id),
          type: new FormControl<boolean>(property.type || false),
          debtor_id: new FormControl<number>(property.debtor_id),
          pledgee: new FormControl<string>(property.pledgee),
          accompanied: new FormControl<boolean>(property.accompanied),
          description: new FormControl<string>(property.description, Validators.required),
          comment: new FormControl<string>(property.comment),
          predicted_cost: new FormControl<number>(property.predicted_cost ?? 0, Validators.min(0)),
          inventory_date: new FormControl<Date | null>(
            property.inventory_date ? new Date(property.inventory_date) : null,
          ),
          appraisal_date: new FormControl<Date | null>(
            property.appraisal_date ? new Date(property.appraisal_date) : null,
          ),
          sale_date: new FormControl<Date | null>(
            property.sale_date ? new Date(property.sale_date) : null,
          ),
        });
        properties.push(fg);
      }
    }
    return new FormGroup(
      {
        id: new FormControl<number>(debtor.id || 0),
        // Общая информация
        name: new FormControl<string>(debtor.name || '', Validators.required),
        full_name: new FormControl<string>(debtor.full_name || ''),
        inn: new FormControl<string | null>(debtor.inn || null, [
          Validators.required,
          Validators.pattern('^([0-9]{10}|[0-9]{12})$'),
          Validators.minLength(10),
          Validators.maxLength(12),
          INNValidator,
        ]),
        kpp: new FormControl<string | null>(debtor.kpp || null, [
          Validators.pattern('^[0-9]{9}$'),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
        ogrn: new FormControl<string | null>(debtor.ogrn || null, [
          Validators.pattern('^([0-9]{13}|[0-9]{15})$'),
          Validators.minLength(13),
          Validators.maxLength(15),
          OGRNValidator,
        ]),
        address: new FormControl<string | null>(debtor.address || null),
        post_address: new FormControl<string | null>(debtor.post_address || null),
        case_no: new FormControl<string | null>(debtor.case_no || null),
        arbitration_id: new FormControl<string | null>(debtor.arbitration_id || null),
        decision_date: new FormControl<Date | null>(
          debtor.decision_date ? new Date(debtor.decision_date) : null,
        ),
        initiation_date: new FormControl<Date | null>(
          debtor.initiation_date ? new Date(debtor.initiation_date) : null,
        ),
        procedure_date: new FormControl<Date | null>(
          debtor.procedure_date ? new Date(debtor.procedure_date) : null,
        ),
        bankruptcy_manager_id: new FormControl<number | null>(debtor.bankruptcy_manager_id ?? null),
        project_id: new FormControl<number | null>(debtor.project_id || null, Validators.required),
        project: new FormControl<Project | null>(debtor.project || null),
        contacts: new FormControl<string | null>(debtor.contacts || null),
        stage_id: new FormControl<number | null>(debtor.stage_id || null),
        kind: new FormControl<boolean>(debtor.kind || false),
        category_id: new FormControl<number | null>(debtor.category_id || null),
        procedure_id: new FormControl<number | null>(debtor.procedure_id || null),
        bankruptcy_manager: new FormControl(debtor.bankruptcy_manager || null),
        bankruptcy_manager_sro: new FormControl<string | null>(
          debtor?.bankruptcy_manager ? debtor?.bankruptcy_manager?.sro?.name : null,
        ),
        links,

        // Банковские счета
        bank_details: bankDetails,

        // Имущество и обязательства
        registry: new FormControl<number | null>(debtor.registry, [Validators.min(0)]), //       Общий РТК (все очереди)
        deposit: new FormControl<number | null>(debtor.deposit, [Validators.min(0)]), //         Общая сумма сопровождаемых требований
        not_deposit: new FormControl<number | null>(debtor.not_deposit, [Validators.min(0)]), // Сумма сопровождаемых требований, обеспеченных залогом
        deposit_share: new FormControl<number | null>(debtor.deposit_share, [
          Validators.min(0),
          Validators.max(100),
        ]), //         от реестра с залогом (наблюдение)
        not_deposit_share: new FormControl<number | null>(debtor.not_deposit_share, [
          Validators.min(0),
          Validators.max(100),
        ]), // от реестра без залога (конкурс)
        assets: new FormControl(debtor.assets),
        properties,

        // Финансы и планирование
        reportable: new FormControl<boolean>(debtor.reportable || false), // Выводить ли должника в отчет для клиента
        targets: new FormControl(debtor.targets), //            Поставленные цели,      SimpleEdit
        persons: new FormControl(debtor.persons), //          Представляемые лица,    SimpleEdit
        incomes: new FormControl(debtor.incomes), //          Источники дохода,       SimpleEdit2
        expenses: new FormControl(debtor.expenses), //        Статьи расходов,        SimpleEdit2
        profit_cat: new FormControl(debtor.profit_cat || null),
        profit_cat_id: new FormControl<number>(debtor.profit_cat_id), //    Категория прибыльности
        income_date: new FormControl<Date | null>(
          debtor.income_date ? new Date(debtor.income_date) : null,
        ),
        comments: new FormControl<string>(debtor.comments),
        action_plans: new FormControl(debtor.action_plans || []),
        created_at: new FormControl<Date>(debtor.created_at),
        // Страховые полисы
        primary,
        additional,
      },
      [],
      [],
    );
  }

  public static prepForSave(old: Debtor, current: Debtor, nullables: Set<string>): Partial<Debtor> {
    const update: Partial<Debtor> = {};
    for (const prop in current) {
      if (Object.prototype.hasOwnProperty.call(current, prop)) {
        if (old.id === 0 && current[prop] === null) {
          continue;
        }
        if (nullables.has(prop)) {
          continue;
        }
        if (Array.isArray(current[prop])) {
          if (!equals(old[prop], current[prop])) {
            if (
              current[prop].length > 0 &&
              Object.prototype.hasOwnProperty.call(current[prop][0], 'type') &&
              !(
                typeof current[prop][0].type === 'number' ||
                typeof current[prop][0].type === 'boolean'
              )
            ) {
              update[prop] = current[prop].map((el) => {
                delete el.type;
                return el;
              });
            } else {
              update[prop] = current[prop];
            }
          }
        } else if (old[prop] !== current[prop]) {
          update[prop] = current[prop];
        }
      }
    }
    if (Object.entries(update).length) {
      return update;
    }
    return null;
  }

  @Action(FetchProjectsAndDebtors, { cancelUncompleted: false })
  public fetchProjectsAndDebtors({ getState, patchState }: StateContext<DebtorStateModel>) {
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
  }

  @Action(FetchDebtors, { cancelUncompleted: false })
  public fetchItems({ getState, setState, patchState }: StateContext<DebtorStateModel>) {
    const state = getState();
    if (!state.loading && !state.debtors.length) {
      patchState({ loading: true });
      return this.debtorSrv.getAllWithParams(new HttpParams().set('limit', '-1')).pipe(
        tap(({ debtors, count }) => {
          const map = new Map(debtors.map((i): [number, string] => [i.id, i.name]));
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
  }

  @Action(FetchPage, { cancelUncompleted: true })
  public fetchPage({ getState, setState }: StateContext<DebtorStateModel>, { payload }) {
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
  public getItem({ setState, getState }: StateContext<DebtorStateModel>, { payload }) {
    const state = getState();
    let selected: Debtor;
    if (payload === 0) {
      selected = { id: 0, inn: null } as Debtor;
      return setState({ ...state, selected });
    } else {
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
  }

  @Action(ClearSelected)
  public clearSelected({ patchState }: StateContext<DebtorStateModel>) {
    return patchState({ selected: null });
  }

  @Action(AddItem)
  public addItem({ getState, patchState }: StateContext<DebtorStateModel>, { payload }) {
    patchState({ loading: true });
    const state = getState();
    return this.debtorSrv.add(payload).pipe(
      tap((selected: Debtor) => {
        const debtor = DebtorsState.debtorConvertFunction(selected);
        patchState({ selected, debtors: [debtor, ...state.debtors] });
      }),
      catchError((err) => throwError(err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { patchState, getState, setState }: StateContext<DebtorStateModel>,
    { payload },
  ) {
    patchState({ loading: true });
    const state = getState();
    const debtors = [...state.debtors];
    return this.debtorSrv.update(payload).pipe(
      tap((selected) => {
        const idx = debtors.findIndex((el) => el.id === selected.id);
        debtors[idx] = DebtorsState.debtorConvertFunction(selected);
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

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, dispatch }: StateContext<DebtorStateModel>,
    { payload },
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.debtorSrv.delete(payload).pipe(
      tap(() => {
        const snackBarRef = this.snackBar.open(`Должник успешно удален`, 'Отменить', {
          duration: 10000,
        });
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
            dispatch(new RestoreItem(payload));
          });
      }),
      catchError((error) => {
        console.error(error.message);
        this.snackBar.open(error.message);
        return throwError(() => error);
      }),
    );
  }

  @Action(RestoreItem)
  public restoreItem(
    { getState, patchState, setState }: StateContext<DebtorStateModel>,
    { payload },
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
    { payload },
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.selected;
    if (state.selected.insurance_policies.length > 0) {
      const idx = selected.insurance_policies.findIndex((el) => el.id === payload.id);
      selected.insurance_policies[idx] = payload;
    } else {
      return dispatch(new AddDebtorPolicy(payload));
    }
    patchState({ selected, loading: false });
  }

  @Action(AddDebtorPolicy)
  public addPolicy(
    { getState, patchState, setState }: StateContext<DebtorStateModel>,
    { payload },
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = clone(state.selected);
    selected.insurance_policies.push(payload);
    setState({ ...state, selected, loading: false });
  }

  @Action(DeleteDebtorPolicy)
  public deletePolicy({ getState, patchState }: StateContext<DebtorStateModel>, { payload }) {
    patchState({ loading: true });
    const state = getState();
    const selected = clone(state.selected);
    const idx = selected.insurance_policies.findIndex((el) => el.id === payload);
    selected.insurance_policies.splice(idx, 1);
    patchState({ selected, loading: false });
  }
}
