import type { CostReal, Debtor, Interval } from '@sotbi/models';

export class FetchCostsReal {
  public static readonly type = '[COSTREAL] Fetch items';
  constructor(public payload: Interval) {}
}

export class FilterCostsReal {
  public static readonly type = '[COSTREAL] Filter items';
  constructor(public payload: Interval) {}
}

export class EmptyCostsReal {
  public static readonly type = '[COSTREAL] Empty list items';
}

export class AddCostReal {
  public static readonly type = '[COSTREAL] Add item';
  constructor(public payload: { idx: number; cost: CostReal }) {}
}

export class AddEmptyCostsReal {
  public static readonly type = '[COSTREAL] Empty items';
  constructor(public payload = 10) {}
}

export class AddAbsenceCostsReal {
  public static readonly type = '[COSTREAL] vacation/sick items';
  constructor(
    public payload: { days: number[]; debtor: Debtor; interval: Interval },
  ) {}
}

export class UpdateCostReal {
  public static readonly type = '[COSTREAL] Update item';
  constructor(public payload: { idx: number; cost: Partial<CostReal> }) {}
}

export class CancelCostReal {
  public static readonly type = '[COSTREAL] Cancel edited item';
  constructor(public payload: number) {}
}
export class EmptyCostReal {
  public static readonly type = '[COSTREAL] Empty item';
  constructor(public payload: number) {}
}
export class SaveAllCostReal {
  public static readonly type = '[COSTREAL] Save all items';
}
export class CancelAllCostReal {
  public static readonly type = '[COSTREAL] Cancel all items';
}

export class EditCostReal {
  public static readonly type = '[COSTREAL] Edit item';
  constructor(public payload: { idx: number; cost: CostReal }) {}
}

export class DeleteCostReal {
  public static readonly type = '[COSTREAL] Delete item';
  constructor(public payload: { id: number; interval: Interval }) {}
}
