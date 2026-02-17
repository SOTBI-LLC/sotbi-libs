import type { MessageType } from '@sotbi/models';

export class FetchMessageTypes {
  public static readonly type = '[EFRSB MESSAGE TYPE] Fetch items';
}

export class AddMessageType {
  public static readonly type = '[EFRSB MESSAGE TYPE] Add item';
  constructor(public payload: Partial<MessageType>) {}
}

export class UpdateMessageType {
  public static readonly type = '[EFRSB MESSAGE TYPE] Update item';
  constructor(public payload: MessageType) {}
}

export class DeleteMessageType {
  public static readonly type = '[EFRSB MESSAGE TYPE] Delete item';
  constructor(public payload: number) {}
}
