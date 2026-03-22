import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { CounterpartyEmployeeService } from '@sotbi/data-access';
import type { Employee } from '@sotbi/models';
import { fromBase62 } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { GetEmployees, UpdateEmployees } from './employee.actions';

export class EmployeeStateModel {
  public current_counterparty_id: number | null = null;
  public items: Employee[] = [];
  public loading = false;
}

@State<EmployeeStateModel>({
  name: 'employees',
  defaults: {
    current_counterparty_id: null,
    items: [],
    loading: false,
  },
})
@Injectable()
export class EmployeeState {
  private readonly srv = inject(CounterpartyEmployeeService);

  @Selector()
  public static loading(state: EmployeeStateModel) {
    return state.loading;
  }
  @Selector()
  public static getEmployees(state: EmployeeStateModel) {
    return state.items;
  }

  @Action(GetEmployees, { cancelUncompleted: true })
  public getEmployees(
    { patchState }: StateContext<EmployeeStateModel>,
    { payload }: GetEmployees,
  ) {
    const id = fromBase62(payload);
    patchState({ loading: true });
    return this.srv.GetAll(id).pipe(
      tap((items) => patchState({ items, current_counterparty_id: id })),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateEmployees)
  public updateEmployees(
    { patchState, getState }: StateContext<EmployeeStateModel>,
    { payload }: UpdateEmployees,
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.srv
      .updateAll(+(state.current_counterparty_id ?? 0), payload)
      .pipe(
        tap((items) => patchState({ items })),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
  }
}
