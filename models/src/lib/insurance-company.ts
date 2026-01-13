import { InsurancePolicy } from './insurance-policy';
import { User } from './user';

export interface InsuranceCompany {
  id: number;
  name: string;
  inn: string;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: number;
  updater?: User;
  insurance_policies?: InsurancePolicy[];
}

export enum InsuranceActive {
  FALSE = 'false',
  TRUE = 'true',
}

export const InsuranceActiveArr: { id: InsuranceActive; ru: string }[] = [
  { id: InsuranceActive.FALSE, ru: 'Срок истек' },
  { id: InsuranceActive.TRUE, ru: 'Действующая' },
];
