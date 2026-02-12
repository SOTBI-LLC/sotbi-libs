import type { InsurancePolicy } from './insurance-policy';
import type { User } from './user';

export class InsuranceCompany {
  public id = 0;
  public name: string | null = null;
  public inn: string | null = null;
  public created_at: Date | null = null;
  public updated_at: Date | null = null;
  public updated_by = 0;
  public updater: User | null = null;
  public insurance_policies: InsurancePolicy[] = [];
}

export enum InsuranceActive {
  FALSE = 'false',
  TRUE = 'true',
}

export const InsuranceActiveArr: { id: InsuranceActive; ru: string }[] = [
  { id: InsuranceActive.FALSE, ru: 'Срок истек' },
  { id: InsuranceActive.TRUE, ru: 'Действующая' },
];
