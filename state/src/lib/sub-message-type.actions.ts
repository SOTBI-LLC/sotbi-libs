import type { SubMessageType } from '@sotbi/models';

export class FetchSubMessageTypes {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Fetch items';
}

export class AddSubMessageType {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Add item';
  constructor(public payload: Partial<SubMessageType>) {}
}

export class UpdateSubMessageType {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Update item';
  constructor(public payload: SubMessageType) {}
}

export class DeleteSubMessageType {
  public static readonly type = '[EFRSB SUB MESSAGE TYPE] Delete item';
  constructor(public payload: number) {}
}
