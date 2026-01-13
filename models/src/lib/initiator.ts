import { Accreditation } from './accreditation';
import { BankDetail } from './bankdetail';
import { Bidding } from './bidding';

export class Initiator {
  id: number | null = null;
  name: string = '';
  type: boolean = false;
  is_bankruptcy: boolean = false;
  full_name?: string | null = null;
  inn: string = '';
  kpp?: string | null = null;
  ogrn: string = '';
  snils?: string | null = null;
  address: string = '';
  post_address?: string | null = null;
  bank_details?: BankDetail[] = [];
  accreditations?: Accreditation[] = [];
  email: string = '';
  phone: string = '';
  position: string = '';
  chief: string = '';
  biddings?: Bidding[] = [];
}
