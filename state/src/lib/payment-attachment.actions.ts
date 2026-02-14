import type { PaymentAttachment } from '@sotbi/models';

export class GetAllItems {
  public static readonly type = '[PAYMENT ATTACHMENT] Get all items';
  constructor(public readonly payload: number) {}
}

export class GetItem {
  public static readonly type = '[PAYMENT ATTACHMENT] Get item';
  constructor(public readonly payload: number) {}
}

export class AddItem {
  public static readonly type = '[PAYMENT ATTACHMENT] Add item';
  constructor(public readonly payload: Partial<PaymentAttachment>) {}
}

export class UpdateItem {
  public static readonly type = '[PAYMENT ATTACHMENT] Update item';
  constructor(public readonly payload: PaymentAttachment) {}
}

export class DeleteItem {
  public static readonly type = '[PAYMENT ATTACHMENT] Delete item';
  constructor(public readonly payload: number) {}
}

export class DeleteItems {
  public static readonly type = '[PAYMENT ATTACHMENT] Delete items';
  constructor(public readonly payload: string[]) {}
}
