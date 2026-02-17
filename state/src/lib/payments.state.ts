import { formatDate } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PaymentService } from '@sotbi/data-access';
import type { IPaymentDocumentFilter, PaymentDocument } from '@sotbi/models';
import { DD_MM_YYYY_HH_MM_SS } from '@sotbi/utils';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { GetDebtorPayments, GetPayment } from './payments.actions';

export interface PaymentDocumentsStateModel {
  items: PaymentDocument[];
  selected: PaymentDocument | null;
  loading: boolean;
  count: number;
}

@State<PaymentDocumentsStateModel>({
  name: 'payments',
  defaults: {
    items: [],
    selected: null,
    loading: false,
    count: 0,
  },
})
@Injectable()
export class PaymentDocumentsState {
  private readonly paymentSrv = inject(PaymentService);

  public static getHttpParams(filter: IPaymentDocumentFilter): HttpParams {
    if (filter.start) {
      filter.start.setHours(0, 0, 0);
    }
    if (filter.end) {
      filter.end.setHours(23, 59, 59);
    }
    let params = new HttpParams();
    if (filter.bank_detail_id.length > 0) {
      params = params.set('accounts', filter.bank_detail_id + '');
      // } else {
      //   params = params.set('accounts', actuals.map((el) => el) + '');
    }
    if (filter.start) {
      params = params.set(
        'start',
        formatDate(filter.start, DD_MM_YYYY_HH_MM_SS, 'ru-Ru'),
      );
    }
    if (filter.end) {
      params = params.set(
        'end',
        formatDate(filter.end, DD_MM_YYYY_HH_MM_SS, 'ru-Ru'),
      );
    }
    if (filter.query) {
      params = params.set('query', filter.query);
    }
    if (filter.inn) {
      params = params.set('inn', filter.inn);
    }
    if (filter.number) {
      params = params.set('number', filter.number);
    }
    params = params.set('from', '0');
    params = params.set('to', '-1');
    return params;
  }

  @Selector()
  public static getLoading(state: PaymentDocumentsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getItems(state: PaymentDocumentsStateModel): PaymentDocument[] {
    return state.items;
  }

  @Action(GetDebtorPayments)
  public getDebtorPayments(
    { patchState }: StateContext<PaymentDocumentsStateModel>,
    { payload }: GetDebtorPayments,
  ) {
    if (payload.bank_detail_id.length === 0) {
      patchState({
        items: [],
        count: 0,
        selected: null,
      });
      return;
    }
    patchState({ loading: true });

    this.paymentSrv
      .getDebtorsPayments(PaymentDocumentsState.getHttpParams(payload))
      .pipe(
        tap(({ payments, count }) => {
          patchState({
            selected: null,
            items: payments,
            count,
          });
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

  @Action(GetPayment)
  public getItem(
    { patchState }: StateContext<PaymentDocumentsStateModel>,
    { payload }: GetPayment,
  ) {
    patchState({ loading: true });
    if (payload) {
      this.paymentSrv.getItem(payload).pipe(
        tap((selected: PaymentDocument) => {
          patchState({ selected });
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
}
