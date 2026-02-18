import type { Accreditation } from './accreditation';
import type { BankDetail } from './bankdetail';
import type { Bidding } from './bidding';

export class Initiator {
  public id = 0;
  public name = '';
  public type = false;
  public is_bankruptcy = false;
  public full_name = '';
  public inn = '';
  public kpp = '';
  public ogrn = '';
  public snils = '';
  public address = '';
  public post_address = '';
  public bank_details: BankDetail[] = [];
  public accreditations: Accreditation[] = [];
  public email = '';
  public phone = '';
  public position = '';
  public chief = '';
  public biddings: Bidding[] = [];

  constructor(data: Partial<Initiator> = {}) {
    Object.assign(this, data);
  }
}
