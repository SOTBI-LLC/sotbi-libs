import { Initiator } from '@sotbi/models';

export class FetchInitiators {
  public static readonly type = '[INITIATORS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetInintiator {
  public static readonly type = '[INITIATORS] Get item';
  constructor(public payload: number) {}
}

export class AddInintiator {
  public static readonly type = '[INITIATORS] Add item';
  constructor(public payload: Initiator) {}
}

export class EditItem {
  public static readonly type = '[INITIATORS] Edit item';
  constructor(public payload: Initiator) {}
}

export class DeleteItem {
  public static readonly type = '[INITIATORS] Delete item';
  constructor(public payload: number) {}
}
