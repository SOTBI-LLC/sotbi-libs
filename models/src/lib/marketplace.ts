import type { BankDetail } from './bankdetail';

export interface Marketplace {
  id: number;
  name: string;
  full_name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  post_address: string;
  email: string;
  site: string;
  uuid: string;
  bank_details?: BankDetail[];
}
