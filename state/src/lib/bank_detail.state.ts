import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { CounterpartyBankDetailService } from '@sotbi/data-access';
import type { BankDetail } from '@sotbi/models';
import { fromBase62 } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { GetBankDetails, UpdateBankDetails } from './bank_detail.actions';

export class BankDetailStateModel {
  public current_counterparty_id: number | null = null;
  public items: BankDetail[] = [];
  public loading = false;
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
  private readonly srv = inject(CounterpartyBankDetailService);

  @Selector()
  public static loading(state: BankDetailStateModel) {
    return state.loading;
  }
  @Selector()
  public static getBankDetails(state: BankDetailStateModel) {
    return state.items;
  }

  @Action(GetBankDetails, { cancelUncompleted: true })
  public getBankDetails(
    { getState, patchState }: StateContext<BankDetailStateModel>,
    { payload }: GetBankDetails,
  ) {
    const state = getState();
    if (state.items.length < 1) {
      const id = fromBase62(payload);
      if (id !== +(state.current_counterparty_id ??= 0)) {
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
    return;
  }

  @Action(UpdateBankDetails)
  public UpdateBankDetails(
    { patchState, getState }: StateContext<BankDetailStateModel>,
    { payload }: UpdateBankDetails,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (state.current_counterparty_id == null) {
      throwError(() => new Error('current_counterparty_id is null'));
      return;
    }
    return this.srv.updateAll(+state.current_counterparty_id, payload).pipe(
      tap((items) => {
        patchState({ items });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
