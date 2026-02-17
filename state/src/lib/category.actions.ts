import type { SimpleEdit2Model } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchCategories {
  public static readonly type = '[CATEGORY] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetCategory {
  public static readonly type = '[CATEGORY] Get item';
  constructor(public payload: number) {}
}

export class AddCategory {
  public static readonly type = '[CATEGORY] Add item';
  constructor(public payload: Partial<SimpleEdit2Model>) {}
}

export class EditCategory {
  public static readonly type = '[CATEGORY] Edit item';
  constructor(public payload: WithId<SimpleEdit2Model>) {}
}

export class DeleteCategory {
  public static readonly type = '[CATEGORY] Delete item';
  constructor(public payload: number) {}
}
