import type { Bankruptcy } from './bankruptcy';
import type { Debtor } from './debtor';
import type { InsuranceAttachment } from './insurance-attachment';
import type { InsuranceCompany } from './insurance-company';
import type { User } from './user';

export interface InsurancePolicy {
  id: number;
  type: InsurancePolicyType;
  sum_insured: number;
  insurance_premium: number;
  insurance_company_id: number;
  insurance_company?: InsuranceCompany;
  from: Date;
  to: Date;
  contacts?: string;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: number;
  updater?: User;
  bankruptcy_manager_id: number;
  bankruptcy_manager?: Bankruptcy;
  debtor_id?: number;
  debtor?: Debtor;
  insurance_attachments: InsuranceAttachment[];
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
  InsurancePolicyTypeArr.map((i): [string, string] => [i.id, i.ru])
);
