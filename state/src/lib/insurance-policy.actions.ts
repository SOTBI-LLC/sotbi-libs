import { InsurancePolicy } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[INSURANCE POLICY] Fetch items';
}

export class GetItem {
  public static readonly type = '[INSURANCE POLICY] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[INSURANCE POLICY] Add item';
  constructor(public payload: Partial<InsurancePolicy>) {}
}

export class UpdateItem {
  public static readonly type = '[INSURANCE POLICY] Update item';
  constructor(public payload: Partial<InsurancePolicy>) {}
}

export class DeleteItem {
  public static readonly type = '[INSURANCE POLICY] Delete item';
  constructor(public payload: number) {}
}
