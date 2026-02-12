import type { Bankruptcy } from './bankruptcy';
import type { Debtor } from './debtor';
import type { InsuranceAttachment } from './insurance-attachment';
import type { InsuranceCompany } from './insurance-company';
import type { User } from './user';

export class InsurancePolicy {
  public id = 0;
  public type: InsurancePolicyType = InsurancePolicyType.ADDITIONAL;
  public sum_insured = 0;
  public insurance_premium = 0;
  public insurance_company_id = 0;
  public insurance_company: InsuranceCompany | null = null;
  public from: Date | null = null;
  public to: Date | null = null;
  public contacts: string | null = null;
  public created_at: Date | null = null;
  public updated_at: Date | null = null;
  public updated_by = 0;
  public updater: User | null = null;
  public bankruptcy_manager_id = 0;
  public bankruptcy_manager?: Bankruptcy;
  public debtor_id = 0;
  public debtor: Debtor | null = null;
  public insurance_attachments: InsuranceAttachment[] = [];
}

export enum InsurancePolicyType {
  PRIMARY = 'primary',
  ADDITIONAL = 'additional',
}

export const InsurancePolicyTypeArr: { id: InsurancePolicyType; ru: string }[] =
  [
    { id: InsurancePolicyType.PRIMARY, ru: 'Основной' },
    { id: InsurancePolicyType.ADDITIONAL, ru: 'Дополнительный' },
  ];

export const InsurancePolicyTypeMap = new Map(
  InsurancePolicyTypeArr.map((i): [string, string] => [i.id, i.ru]),
);
