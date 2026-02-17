import type { InsuranceCompany, InsurancePolicy } from '@sotbi/models';

export class FetchCompanies {
  public static readonly type = '[INSURANCE COMPANY] Fetch Companies';
}

export class GetCompany {
  public static readonly type = '[INSURANCE COMPANY] Get Company';
  constructor(public payload: number) {}
}

export class AddCompany {
  public static readonly type = '[INSURANCE COMPANY] Add Company';
  constructor(public payload: Partial<InsuranceCompany>) {}
}

export class UpdateCompany {
  public static readonly type = '[INSURANCE COMPANY] Update Company';
  constructor(
    public payload: Partial<InsuranceCompany> & { id: number | string },
  ) {}
}

export class UpdateInsurancePolicy {
  public static readonly type = '[INSURANCE COMPANY] Update policy';
  constructor(public payload: InsurancePolicy) {}
}

export class AddInsurancePolicy {
  public static readonly type = '[INSURANCE COMPANY] Add policy';
  constructor(public payload: InsurancePolicy) {}
}

export class DeleteInsurancePolicy {
  public static readonly type = '[INSURANCE COMPANY] Delete policy';
  constructor(public payload: number) {}
}

export class DeleteCompany {
  public static readonly type = '[INSURANCE COMPANY] Delete Company';
  constructor(public payload: number) {}
}
