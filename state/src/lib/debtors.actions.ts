import type { Debtor, InsurancePolicy } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchDebtors {
  public static readonly type = '[DEBTORS] Fetch items';
  // constructor(public payload: { type: string }) {}
}
export class FetchProjectsAndDebtors {
  public static readonly type = '[DEBTORS] Fetch items as projects';
}

export class FetchDebtorsPage {
  public static readonly type = '[DEBTORS] Fetch page of items';
  constructor(public payload: { from: number; limit: number }) {}
}

export class GetDebtor {
  public static readonly type = '[DEBTORS] Get item';
  constructor(public payload: number) {}
}
export class ClearSelectedDebtor {
  public static readonly type = '[DEBTORS] Clear Selected';
}

export class AddDebtor {
  public static readonly type = '[DEBTORS] Add item';
  constructor(public payload: Partial<Debtor>) {}
}

export class UpdateDebtorItem {
  public static readonly type = '[DEBTORS] Edit item';
  constructor(public payload: WithId<Debtor>) {}
}

export class DeleteDebtorItem {
  public static readonly type = '[DEBTORS] Delete item';
  constructor(public payload: number) {}
}

export class RestoreDebtor {
  public static readonly type = '[DEBTORS] Restore item';
  constructor(public payload: number) {}
}

export class UpdateDebtorPolicy {
  public static readonly type = '[DEBTORS] Update policy';
  constructor(public payload: WithId<InsurancePolicy>) {}
}

export class AddDebtorPolicy {
  public static readonly type = '[DEBTORS] Add policy';
  constructor(public payload: Partial<InsurancePolicy>) {}
}
export class DeleteDebtorPolicy {
  public static readonly type = '[DEBTORS] delete policy';
  constructor(public payload: number) {}
}
