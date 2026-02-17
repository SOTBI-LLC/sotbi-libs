import type { SimpleEditModel } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchStages {
  public static readonly type = '[STAGES] Fetch items';
}

export class GetStage {
  public static readonly type = '[STAGES] Get item';
  constructor(public payload: number) {}
}

export class AddStage {
  public static readonly type = '[STAGES] Add item';
  constructor(public payload: string) {}
}

export class EditStage {
  public static readonly type = '[STAGES] Edit item';
  constructor(public payload: WithId<SimpleEditModel>) {}
}

export class DeleteStage {
  public static readonly type = '[STAGES] Delete item';
  constructor(public payload: number) {}
}
