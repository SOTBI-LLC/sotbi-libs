import type { Accreditation } from './accreditation';
import type { BankDetail } from './bankdetail';
import type { Bidding } from './bidding';

export class Initiator {
  public id = 0;
  public name = '';
  public type = false;
  public is_bankruptcy = false;
  public full_name?: string | null = null;
  public inn = '';
  public kpp?: string | null = null;
  public ogrn = '';
  public snils?: string | null = null;
  public address = '';
  public post_address?: string | null = null;
  public bank_details?: BankDetail[] = [];
  public accreditations?: Accreditation[] = [];
  public email = '';
  public phone = '';
  public position = '';
  public chief = '';
  public biddings?: Bidding[] = [];
}
