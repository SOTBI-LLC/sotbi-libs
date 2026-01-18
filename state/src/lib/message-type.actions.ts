import { MessageType } from '@sotbi/models';

export class FetchMessageTypes {
  public static readonly type = '[EFRSB MESSAGE TYPE] Fetch items';
}

export class AddItem {
  public static readonly type = '[EFRSB MESSAGE TYPE] Add item';
  constructor(public payload: Partial<MessageType>) {}
}

export class UpdateItem {
  public static readonly type = '[EFRSB MESSAGE TYPE] Update item';
  constructor(public payload: MessageType) {}
}

export class DeleteItem {
  public static readonly type = '[EFRSB MESSAGE TYPE] Delete item';
  constructor(public payload: number) {}
}
