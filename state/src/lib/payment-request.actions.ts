import type { PaymentRequest } from '@sotbi/models';

export class FetchPaymentRequests {
  public static readonly type = '[PAYMENT REQUEST] Fetch items';
}

export class GetPaymentRequest {
  public static readonly type = '[PAYMENT REQUEST] Get item';
  constructor(public readonly payload: number) {}
}
export class AddDirtyPaymentRequest {
  public static readonly type = '[PAYMENT REQUEST] Add dirty item';
  constructor(public readonly payload: number) {}
}

export class AddPaymentRequest {
  public static readonly type = '[PAYMENT REQUEST] Add item';
  constructor(public readonly payload: Partial<PaymentRequest>) {}
}

export class UpdatePaymentRequest {
  public static readonly type = '[PAYMENT REQUEST] Update item';
  constructor(
    public readonly payload: Partial<PaymentRequest> & { id: number },
  ) {}
}

export class DeletePaymentRequest {
  public static readonly type = '[PAYMENT REQUEST] Delete item';
  constructor(public readonly payload: number) {}
}
