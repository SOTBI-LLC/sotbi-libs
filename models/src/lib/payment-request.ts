import type { BankDetail } from './bankdetail';
import type { Debtor } from './debtor';
import type { Defrayment } from './defrayment';
import type { PaymentAttachment } from './payment-attachment';
import type { StatusEnum } from './status-request';
import type { User } from './user';

export interface PaymentRequest {
  id: number;
  status?: StatusEnum; // статус заявки
  debtor_id: number; // ForeignKey Debtor
  debtor?: Debtor; // Должник
  bank_detail_id: number; // ForeignKey BankDetail
  bank_detail?: BankDetail; // Детали о банке
  bank_detail_bik?: string;
  target: PaymentRequestTarget; // Цель
  request_type: PaymentRequestType; // Вид заявки
  description?: string; // Комментарий заказчика
  worked_by_id: number; // в работе у...
  worked_by?: User; // в работе у...
  defrayments: Defrayment[]; // Перечень платежей в заявке
  payment_attachments: PaymentAttachment[]; // Список файлов вложений к заявке
  histories?: PaymentRequestHistory[]; // История обновлений
  updated_by_id?: number; // Кто обновил запись ID
  updated_by?: User; // Кто обновил запись
  doer_comment?: string; // Комментарий исполнителя
  project_name?: string;
  debtor_name?: string;
  defrayments_count?: number; // Количество платежей
  updated_by_name?: string; // Юзер, последним обновивший запись
  worked_by_name?: string; // Юзер, последним обновивший запись
  project_owner_id?: number; // Ответственный по проекту на котором должник
}
export interface PaymentRequestHistory extends PaymentRequest {
  created_at: Date;
  revision: number;
  action: string;
}

export enum PaymentRequestTarget {
  PAY = 'pay',
  CARDFILE = 'cardfile',
}

export const PaymentRequestTargetArr: {
  id: PaymentRequestTarget;
  ru: string;
}[] = [
  { id: PaymentRequestTarget.PAY, ru: '💰 Оплатить' },
  { id: PaymentRequestTarget.CARDFILE, ru: '🗂️ Картотека' },
];

export const PaymentRequestTargetMap = new Map(
  PaymentRequestTargetArr.map((i): [string, string] => [i.id, i.ru])
);

export enum PaymentRequestType {
  FORM = 'form',
  SIGN = 'sign',
}

export const PaymentRequestTypeArr: { id: PaymentRequestType; ru: string }[] = [
  { id: PaymentRequestType.FORM, ru: '📝 Сформировать и подписать' },
  { id: PaymentRequestType.SIGN, ru: '🖊️ Подписать' },
];

export const PaymentRequestTypeMap = new Map(
  PaymentRequestTypeArr.map((i): [string, string] => [i.id, i.ru])
);
