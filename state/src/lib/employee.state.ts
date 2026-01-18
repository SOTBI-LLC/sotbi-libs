import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { EmployeeService } from '@services/counterparty.service';
import { LoggerService } from '@services/logger.service';
import { fromBase62 } from '@shared/shared-globals';
import { Employee } from '@sotbi/models';
import { GetEmployees, UpdateEmployees } from '@store/employee.actions';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

export class EmployeeStateModel {
  public current_counterparty_id: number | null;
  public items: Employee[];
  public loading: boolean;
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
  private readonly srv = inject(EmployeeService);
  private readonly log = inject(LoggerService);

  @Selector()
  public static loading(state: EmployeeStateModel) {
    return state.loading;
  }
  @Selector()
  public static getEmployees(state: EmployeeStateModel) {
    return state.items;
  }

  @Action(GetEmployees, { cancelUncompleted: true })
  public getEmployees({ getState, patchState }: StateContext<EmployeeStateModel>, { payload }) {
    this.log.debug(`EmployeeState::GetEmployees(${payload}) -> method called`);
    const state = getState();
    // if (state.items.length < 1) {
    const id = fromBase62(payload);
    if (id !== +state.current_counterparty_id) {
      patchState({ loading: true });
      return this.srv.GetAll(id).pipe(
        catchError((err) => {
          return throwError(() => err);
        }),
        tap({
          next: (items) => {
            patchState({ items, current_counterparty_id: id });
          },
        }),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    }
    //  }
  }

  @Action(UpdateEmployees)
  public updateEmployees({ patchState, getState }: StateContext<EmployeeStateModel>, { payload }) {
    patchState({ loading: true });
    this.log.debug(`EmployeeState::UpdateEmployees() -> method called`, payload);
    const state = getState();
    return this.srv.updateAll(+state.current_counterparty_id, payload).pipe(
      tap((items) => {
        patchState({ items });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
