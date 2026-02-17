import type { Defrayment } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class GetAllDefrayments {
  public static readonly type = '[DEFRAYMENT] Get all items';
  constructor(public readonly payload: number) {}
}

export class GetDefrayment {
  public static readonly type = '[DEFRAYMENT] Get item';
  constructor(public readonly payload: number) {}
}

export class AddDefrayment {
  public static readonly type = '[DEFRAYMENT] Add item';
  constructor(public readonly payload: Partial<Defrayment>) {}
}

export class UpdateDefrayment {
  public static readonly type = '[DEFRAYMENT] Update item';
  constructor(public readonly payload: WithId<Defrayment>) {}
}

export class DeleteDefrayment {
  public static readonly type = '[DEFRAYMENT] Delete item';
  constructor(public readonly payload: number) {}
}
