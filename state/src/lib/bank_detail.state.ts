import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { BankDetailService } from '@services/counterparty.service';
import { LoggerService } from '@services/logger.service';
import { fromBase62 } from '@shared/shared-globals';
import { BankDetail } from '@sotbi/models';
import { GetBankDetails, UpdateBankDetails } from '@store/bank_detail.actions';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

export class BankDetailStateModel {
  public current_counterparty_id: number | null = null;
  public items: BankDetail[] = [];
  public loading: boolean = false;
}

@State<BankDetailStateModel>({
  name: 'bank_details',
  defaults: {
    current_counterparty_id: null,
    items: [],
    loading: false,
  },
})
@Injectable()
export class BankDetailState {
  private readonly srv = inject(BankDetailService);
  private readonly log = inject(LoggerService);

  @Selector()
  public static loading(state: BankDetailStateModel) {
    return state.loading;
  }
  @Selector()
  public static getBankDetails(state: BankDetailStateModel) {
    return state.items;
  }

  @Action(GetBankDetails, { cancelUncompleted: true })
  public getBankDetails({ getState, patchState }: StateContext<BankDetailStateModel>, { payload }) {
    this.log.debug(`BankDetailState::GetBankDetails(${payload}) -> method called`);
    const state = getState();
    if (state.items.length < 1) {
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
    }
  }

  @Action(UpdateBankDetails)
  public UpdateBankDetails(
    { patchState, getState }: StateContext<BankDetailStateModel>,
    { payload },
  ) {
    patchState({ loading: true });
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
