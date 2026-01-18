import { PaymentRequest } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[PAYMENT REQUEST] Fetch items';
}

export class GetItem {
  public static readonly type = '[PAYMENT REQUEST] Get item';
  constructor(public readonly payload: number) {}
}
export class AddDirtyItem {
  public static readonly type = '[PAYMENT REQUEST] Add dirty item';
  constructor(public readonly payload: number) {}
}

export class AddItem {
  public static readonly type = '[PAYMENT REQUEST] Add item';
  constructor(public readonly payload: Partial<PaymentRequest>) {}
}

export class UpdateItem {
  public static readonly type = '[PAYMENT REQUEST] Update item';
  constructor(public readonly payload: Partial<PaymentRequest>) {}
}

export class DeleteItem {
  public static readonly type = '[PAYMENT REQUEST] Delete item';
  constructor(public readonly payload: number) {}
}
