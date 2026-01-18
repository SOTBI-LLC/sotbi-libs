import { HelpFile } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[HELP FILE] Fetch items';
}

export class AddItem {
  public static readonly type = '[HELP FILE] Add item';
  constructor(public payload: { idx: number; item: Partial<HelpFile> }) {}
}

export class AddEmptyItem {
  public static readonly type = '[HELP FILE] Add empty item';
}

export class UpdateItem {
  public static readonly type = '[HELP FILE] Update item';
  constructor(public payload: Partial<HelpFile>) {}
}

export class StartEditItem {
  public static readonly type = '[HELP FILE] Start edit item';
  constructor(public payload: number) {}
}

export class DeleteItem {
  public static readonly type = '[HELP FILE] Delete item';
  constructor(public payload: number) {}
}
