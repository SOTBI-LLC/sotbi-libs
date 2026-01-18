import { SubMessageType } from '@sotbi/models';

export class FetchSubMessageTypes {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Fetch items';
}

export class AddItem {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Add item';
  constructor(public payload: Partial<SubMessageType>) {}
}

export class UpdateItem {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Update item';
  constructor(public payload: SubMessageType) {}
}

export class DeleteItem {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Delete item';
  constructor(public payload: number) {}
}
