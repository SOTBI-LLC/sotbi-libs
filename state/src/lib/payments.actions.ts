import type { IPaymentDocumentFilter } from '@sotbi/models';

export class GetDebtorPayments {
  public static readonly type = '[PAYMENTS] Get Debtor payments';
  constructor(public payload: IPaymentDocumentFilter) {}
}

export class GetPayment {
  public static readonly type = '[PAYMENTS] Get item';
  constructor(public payload: number) {}
}
