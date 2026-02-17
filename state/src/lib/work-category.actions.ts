import type { WorkCategory } from '@sotbi/models';

export class FetchWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Fetch items';
  constructor(public payload = 0) {}
}
export class GetWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Get item';
  constructor(public payload: number) {}
}

export class EditWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Edit item';
  constructor(public payload: { idx: number; workcategory: WorkCategory }) {}
}

export class AddWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Add item';
  constructor(
    public payload: { idx: number; workcategory: Partial<WorkCategory> },
  ) {}
}

export class AddEmptyWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Add empty item';
}
export class SaveAllWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Save all item';
}

export class UpdateWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Update item';
  constructor(
    public payload: Partial<WorkCategory> & { id: number | string },
  ) {}
}

export class CancelWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Cancel edited item';
  constructor(public payload: number) {}
}
export class EmptyWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Empty not saved item';
  constructor(public payload: number) {}
}
export class DeleteWorkCategory {
  public static readonly type = '[WORKCATEGORIES] Delete item';
  constructor(public payload: number) {}
}
