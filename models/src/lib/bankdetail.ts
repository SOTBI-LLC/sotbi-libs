import type { AccountStatement } from './account-statement';
import type { TradingCode } from './bidcode';
import type { Debtor } from './debtor';
import type { Deposit } from './deposit';
import type { Label } from './label';
import type { PaymentRequest } from './payment-request';
import type { Project } from './project';
import type { SimpleEditModel } from './simple-edit';
import type { User } from './user';

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ActualAccount {
  id?: number;
  name: string;
}

export interface BankDetail extends ActualAccount {
  market_place_id?: number;
  debtor_id?: number;
  debtor?: Debtor;
  initiator_id?: number;
  bank_account: string;
  bank: string;
  corr_account: string;
  bik: string;
  city: string;
  location: string;
  open_date: Date | null;
  close_date: Date | null;
  account_type: SimpleEditModel;
  account_type_id?: number;
  created_at?: Date;
  remainings?: Remaining[];
  final_balance?: number;
  end_date?: Date;
  file_created_at?: Date;
  has_client_bank: boolean;
  account_statement_requests?: AccountStatement[];
  payment_request?: PaymentRequest[];
  request_id?: string;
}

export interface Remaining {
  id: number;
  start_date: Date;
  end_date: Date;
  account: string;
  initial_balance: number;
  income: number;
  write_off: number;
  final_balance: number;
  payment_documents?: PaymentDocument[];
  exchange_file_id: number;
  exchange_file: ExchangeFile;
  file?: string;
  type?: boolean;
  creator_id?: number;
  creator?: User;
  created_at?: Date;
  request_id?: string;
}

export interface ExchangeFile {
  id: number;
  format_ver: number;
  encoding: string;
  sender: string;
  receiver: string;
  start_date: Date;
  end_date: Date;
  account: string[];
  remainings: Remaining[];
  file?: string;
  type?: number;
  creator_id: number;
  creator?: User;
  created_at?: Date;
  request_id?: string;
}

export interface PaymentDocument {
  //
  // Основные поля платежного поручения
  // https://nalog-nalog.ru/uplata_nalogov/poryadok_uplaty_nalogov_vznosov/osnovnye_polya_platezhnogo_porucheniya_obrazec/
  //
  id: number;
  document_type: string;
  request_id: UUID;
  number: string; //                   ПЛАТЕЖНОЕ ПОРУЧЕНИЕ №
  income_date: Date; //                Поступ. в банк плат.
  writen_off_date: Date; //            Списано со сч. плат.
  date: Date; //                       Дата
  payment_type: string; //             Вид платежа

  rect_date: Date;
  rect_content: string;

  summ: number; //                     Сумма прописью, Сумма

  payer_account: string; //            Сч. №
  payer_current_account: string; //    Сч. №
  payer1: string; //                   Плательщик
  payer_inn: string; //                ИНН
  payer_kpp: string; //                КПП
  payer_bank1: string; //              Банк плательщика
  payer_bank2: string; //              Банк плательщика
  payer_bik: string; //                БИК

  payer_corr_account: string; //       Сч. №  - корр
  receiver_account: string; //         Сч. №
  receiver_current_account: string; // Сч. №
  receiver1: string; //                Получатель
  receiver_inn: string; //             ИНН
  receiver_kpp: string; //             КПП
  receiver_bank1: string; //           Банк получателя
  receiver_bank2: string; //           Банк получателя
  receiver_bik: string; //             БИК
  receiver_corr_account: string; //    Сч. №  - корр
  indicator_kbk: string; //            КБК
  okato: string; //                    Код ОКТМО вместо ОКАТО
  indicator_basics: string; //         Основание платежа
  indicator_period: string; //         Налоговый период

  priority: string; //                 (21) Очередность платежа
  uin: string; //                      (22) Уникальный идентификатор платежа
  defrayal_type: string;
  compiler_status: string;
  remaining_id: number;
  remaining: Remaining;

  payment_purpose: string; //          Назначение платежа

  creator_id: number;
  bank_detail_id: number;
  bank_detail: BankDetail;
  label_id: number; //
  label: Label;
  deposit_id: number; //               Тип задатка
  deposit: Deposit;
  trading_code_id: number;
  trading_code: TradingCode;
  lot_num: string;
  project: Project;
  project_id: number;
  debtor: Debtor;
  debtor_id: number;
  debtor_name?: string;
  project_name?: string;
  history: PaymentDocumentHistory[];
}

export interface Payment {
  id?: number;
  number: string;
  data: Date;
  inn: string;
  account: string;
  name: string;
  payment_purpose: string;
  defrayal_type: string;
  debet: number;
  credit: number;
  bank_detail_id: number;
  label?: Label;
  label_id: number;
  label_name: string;
  color: string;
  deposit?: Deposit;
  deposit_id: number;
  deposit_name: string;
  trading_code_name: string;
  trading_code_id: number;
  trading_code?: TradingCode;
  debtor_id: number;
  debtor_name: string;
  project_id: number;
  project_name: string;
  selected?: boolean;
}

export interface PaymentDocumentHistory {
  id: number;
  payment_document_id: number;
  old_label_id?: number;
  old_label?: Label;
  new_label_id?: number;
  new_label?: Label;
  old_deposit_id?: number;
  old_deposit?: Deposit;
  new_deposit_id?: number;
  new_deposit?: Deposit;
  old_trading_code_id?: number;
  old_trading_code?: TradingCode;
  new_trading_code_id?: number;
  new_trading_code?: TradingCode;
  old_lot_num?: string;
  new_lot_num?: string;
  updated_by_id: number;
  updated_by: User;
  created_at: Date;
}

/**
 * Sort direction for payment document filtering.
 * Replaces @shared/shared-globals SortDirection.
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
  NONE = '',
}

export interface IPaymentDocumentFilter {
  start: Date;
  end: Date;
  between: number;
  label_id: number[];
  bank_detail_id: number[];
  in: boolean;
  out: boolean;
  sort_in: SortDirection;
  sort_out: SortDirection;
  bidcode: number;
  deposit_id: number[];
  advert: number;
  query: string;
  inn: string;
  number: string;
}

export interface PaymentsOnFilterDataModel {
  filter: Partial<IPaymentDocumentFilter>;
}
