import type { Debtor, InsurancePolicy } from '@sotbi/models';

export class FetchDebtors {
  public static readonly type = '[DEBTORS] Fetch items';
  // constructor(public payload: { type: string }) {}
}
export class FetchProjectsAndDebtors {
  public static readonly type = '[DEBTORS] Fetch items as projects';
}

export class FetchPage {
  public static readonly type = '[DEBTORS] Fetch page of items';
  constructor(public payload: { from: number; limit: number }) {}
}

export class GetDebtor {
  public static readonly type = '[DEBTORS] Get item';
  constructor(public payload: number) {}
}
export class ClearSelected {
  public static readonly type = '[DEBTORS] Clear Selected';
}

export class AddItem {
  public static readonly type = '[DEBTORS] Add item';
  constructor(public payload: Partial<Debtor>) {}
}

export class UpdateItem {
  public static readonly type = '[DEBTORS] Edit item';
  constructor(public payload: Partial<Debtor>) {}
}

export class DeleteItem {
  public static readonly type = '[DEBTORS] Delete item';
  constructor(public payload: number) {}
}

export class RestoreItem {
  public static readonly type = '[DEBTORS] Restore item';
  constructor(public payload: number) {}
}

export class UpdateDebtorPolicy {
  public static readonly type = '[DEBTORS] Update policy';
  constructor(public payload: InsurancePolicy) {}
}

export class AddDebtorPolicy {
  public static readonly type = '[DEBTORS] Add policy';
  constructor(public payload: InsurancePolicy) {}
}
export class DeleteDebtorPolicy {
  public static readonly type = '[DEBTORS] delete policy';
  constructor(public payload: InsurancePolicy) {}
}
