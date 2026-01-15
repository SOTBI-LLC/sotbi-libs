import type { InsurancePolicy } from './insurance-policy';
import type { PostAddress } from './post-address';
import type { Sro } from './sro';

export class Bankruptcy {
  public id: number | null = null;
  public name = '';
  public surname: string | null = null;
  public patronymicname: string | null = null;
  public inn = '';
  public snils = '';
  public show: string | null = null;
  public sro_id: number | null = null;
  public sro: Sro | null = null;
  public post_addresses: PostAddress[] = [];
  public uri: string | null = null;
  public insurance_policies: InsurancePolicy[] = [];
  public deleted_at: Date | null = null;
}
