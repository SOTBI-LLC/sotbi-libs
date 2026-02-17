import type { Message } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchEfrsbMessages {
  public static readonly type = '[EFRSB MESSAGE] Fetch items';
}

export class GetEfrsbMessage {
  public static readonly type = '[EFRSB MESSAGE] Get item';
  constructor(public payload: number) {}
}

export class AddEfrsbMessage {
  public static readonly type = '[EFRSB MESSAGE] Add item';
  constructor(public payload: Partial<Message>) {}
}

export class UpdateEfrsbMessage {
  public static readonly type = '[EFRSB MESSAGE] Update item';
  constructor(public payload: WithId<Message>) {}
}

export class DeleteEfrsbMessage {
  public static readonly type = '[EFRSB MESSAGE] Delete item';
  constructor(public payload: number) {}
}
