import type { PaymentAttachment } from '@sotbi/models';

export class GetAllPaymentAttachments {
  public static readonly type = '[PAYMENT ATTACHMENT] Get all items';
  constructor(public readonly payload: number) {}
}

export class GetPaymentAttachment {
  public static readonly type = '[PAYMENT ATTACHMENT] Get item';
  constructor(public readonly payload: number) {}
}

export class AddPaymentAttachment {
  public static readonly type = '[PAYMENT ATTACHMENT] Add item';
  constructor(public readonly payload: Partial<PaymentAttachment>) {}
}

export class UpdatePaymentAttachment {
  public static readonly type = '[PAYMENT ATTACHMENT] Update item';
  constructor(public readonly payload: PaymentAttachment) {}
}

export class DeletePaymentAttachment {
  public static readonly type = '[PAYMENT ATTACHMENT] Delete item';
  constructor(public readonly payload: number) {}
}

export class DeletePaymentAttachments {
  public static readonly type = '[PAYMENT ATTACHMENT] Delete items';
  constructor(public readonly payload: string[]) {}
}
