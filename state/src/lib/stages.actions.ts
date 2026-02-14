import type { SimpleEditModel } from '@sotbi/models';

export class FetchStages {
  public static readonly type = '[STAGES] Fetch items';
}

export class GetItem {
  public static readonly type = '[STAGES] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[STAGES] Add item';
  constructor(public payload: string) {}
}

export class EditItem {
  public static readonly type = '[STAGES] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[STAGES] Delete item';
  constructor(public payload: number) {}
}
