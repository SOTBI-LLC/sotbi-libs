import type { Initiator } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

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
  constructor(public payload: Partial<Initiator>) {}
}

export class EditInitiator {
  public static readonly type = '[INITIATORS] Edit item';
  constructor(public payload: WithId<Initiator>) {}
}

export class DeleteInitiator {
  public static readonly type = '[INITIATORS] Delete item';
  constructor(public payload: number) {}
}
