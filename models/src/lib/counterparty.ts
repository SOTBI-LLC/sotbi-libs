import { SimpleEditModel } from './simple-edit';

export interface Counterparty {
  id: number;
  name: string;
  full_name: string;
  alias: string;
  kind: boolean;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  post_address?: string;
  contacts: string;
  email: string;
  links: CounterpartyLink[] | null;
  ceo: string;
  chief_accountant: string;
  access: string[];
  created_at: Date;
}

export interface CounterpartyLink {
  name: string;
  url: string;
}

export interface CounterpartyBankDetail {
  id?: number;
  name: string;
  counterparty_id?: number;
  bank_account: string;
  bank: string;
  corr_account: string;
  bik: string;
  city: string;
  location: string;
  open_date: Date;
  close_date: Date;
  account_type_id?: number;
  account_type: SimpleEditModel;
  has_client_bank: boolean;
  updated_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Authz {
  name: string;
  allow_rules: Rule[];
  deny_rules: Rule[];
}

export interface Rule {
  name: string;
  request: Request;
}

export interface Request {
  paths: string[];
  headers: Header[];
}

export interface Header {
  key: string;
  values: string[];
}
