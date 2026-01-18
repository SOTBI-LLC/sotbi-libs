import { Message } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[EFRSB MESSAGE] Fetch items';
}

export class GetItem {
  public static readonly type = '[EFRSB MESSAGE] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[EFRSB MESSAGE] Add item';
  constructor(public payload: Partial<Message>) {}
}

export class UpdateItem {
  public static readonly type = '[EFRSB MESSAGE] Update item';
  constructor(public payload: Message) {}
}

export class DeleteItem {
  public static readonly type = '[EFRSB MESSAGE] Delete item';
  constructor(public payload: number) {}
}
