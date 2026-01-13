import { InsurancePolicy } from './insurance-policy';
import { PostAddress } from './post-address';
import { Sro } from './sro';

export class Bankruptcy {
  id: number | null = null;
  name: string = '';
  surname: string | null = null;
  patronymicname: string | null = null;
  inn: string = '';
  snils: string = '';
  show: string | null = null;
  sro_id: number | null = null;
  sro: Sro | null = null;
  post_addresses: PostAddress[] = [];
  uri: string | null = null;
  insurance_policies: InsurancePolicy[] = [];
  deleted_at: Date | null = null;
}
