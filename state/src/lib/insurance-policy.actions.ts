import type { InsurancePolicy } from '@sotbi/models';

export class FetchInsurancePolicies {
  public static readonly type = '[INSURANCE POLICY] Fetch items';
}

export class GetInsurancePolicy {
  public static readonly type = '[INSURANCE POLICY] Get item';
  constructor(public payload: number) {}
}

export class AddInsurancePolicy {
  public static readonly type = '[INSURANCE POLICY] Add item';
  constructor(public payload: Partial<InsurancePolicy>) {}
}

export class UpdateInsurancePolicy {
  public static readonly type = '[INSURANCE POLICY] Update item';
  constructor(public payload: InsurancePolicy) {}
}

export class DeleteInsurancePolicy {
  public static readonly type = '[INSURANCE POLICY] Delete item';
  constructor(public payload: number) {}
}
