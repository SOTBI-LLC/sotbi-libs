import type { Advert } from './advert';
import type { Attachment } from './attachment';
import type { Bidding } from './bidding';
import type { BidState } from './bidstate';
import type { User } from './user';

export interface Calculation {
  id: number;
  trading_code_id: number;
  trading_code: TradingCode;
  sign: boolean;
  costs: number;
  type: string; // Compensation-компенсация/ Cost-стоимость
  source: string;
  originalFileName: string;
  file: string;
  invoice: string; // Номер счета
  description: string; // Комментарии
  date: Date;
  updated_at: Date; // Дата обновления
  deleted_at: Date; // Дата удаления
  creator_id: number; // создатель id
  creator: User; // создатель
  attachments: Attachment[]; // к каким расходам относится
}

export interface TradingCode {
  id?: number;
  name: string;
  adverts?: Advert[];
  calculations?: Calculation[];
  attachments?: Attachment[];
  biddingId: number;
  bidding?: Bidding;
  organisation_id?: number;
  start_date?: Date | string;
  end_date?: Date | string;
  bid_date?: Date | string;
  bidstate_id?: number;
  bidstate?: BidState;
}

// use in app-footcloth-comp
export interface AllBidCodes {
  trading_code: string;
  trading_code_id: number;
  bidding_name: string;
  bidding_id: number;
  trading_state_id: number;
  trading_state_name: string;
  bidding_state_id: number;
  bidding_state_name: string;
  debtor_state_id: number;
  debtor_state_name: string;
  description: string;
  about_biddings: Date;
  about_results: Date;
  about_agreem: Date;
  project_name: string;
  debtor_name: string;
  debtor_id: string;
  initiator_name: string;
  initiator_id: string;
  status: string;
  expense: number; // расходы - затраты
  compensation: number; // расходы - выставлено
  compensation_paid: number; // расходы - оплачено
  compensation_dolg: number; // расходы - долг
  reward: number; // вознагрождение - выставлено
  reward_paid: number; // вознагрождение - оплачено
  reward_dolg: number; // вознагрождение - долг
  dolg: number; // общий долг
  taxes: number; // налог
  fin_res: number; // финансовый результат
  profit: number; // прибыль проекта
  internal_cost: number; // внутренняя стоимость
  project_transfer: number; // передано в проект
  balance: number; // сальдо по проекту
  procedure_name: string;
  reward_paid_at: Date;
  reward_paid_number: number;
  compensation_paid_at: Date;
  compensation_paid_number: number;
  bankruptcy_manager: string;
  sro_name: string;
}

interface MyType {
  type: string;
  name: string;
}

export const types: MyType[] = [
  { type: 'reward', name: 'Вознаграждение' },
  { type: 'compensation', name: 'Возмещение расходов' },
];

export const intTypes: MyType[] = [
  { type: 'cost', name: 'Внутр. ст-ть торгов' },
  { type: 'transfer', name: 'Передано в проект' },
];

export const sources: MyType[] = [
  { type: 'debtor', name: 'Должник' },
  { type: 'manager', name: 'АУ' },
  { type: 'other', name: 'Иное' },
];
