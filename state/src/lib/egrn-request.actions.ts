import type { EgrnRequest } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchEgrnRequests {
  public static readonly type = '[EGRN REQUEST] Fetch items';
  constructor(
    public readonly payload: { refresh: boolean; view: boolean } = {
      refresh: false,
      view: false,
    },
  ) {}
}

export class GetEgrnRequest {
  public static readonly type = '[EGRN REQUEST] Get item';
  constructor(public readonly payload: number) {}
}

export class AddEgrnRequest {
  public static readonly type = '[EGRN REQUEST] Add item';
  constructor(public readonly payload: Partial<EgrnRequest>) {}
}

export class AddDirtyEgrnRequest {
  public static readonly type = '[EGRN REQUEST] Add dirty item';
  constructor(public readonly payload: number) {}
}

export class UpdateEgrnRequest {
  public static readonly type = '[EGRN REQUEST] Update item';
  constructor(public readonly payload: WithId<EgrnRequest>) {}
}

export class DeleteEgrnRequest {
  public static readonly type = '[EGRN REQUEST] Delete item';
  constructor(public readonly payload: number) {}
}

export class RemoveRealEstate {
  public static readonly type = '[EGRN REQUEST] Remove Real-Estate item';
  constructor(public readonly payload: { idx: number; id: number }) {}
}
