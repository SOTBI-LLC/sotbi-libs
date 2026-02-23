import type { BankDetail } from './bankdetail';
import type { Debtor } from './debtor';
import type { Defrayment } from './defrayment';
import type { PaymentAttachment } from './payment-attachment';
import { StatusEnum } from './status-request';
import type { User } from './user';

export class PaymentRequest {
  public id = 0;
  public status = StatusEnum.DRAFT; // статус заявки
  public debtor_id = 0; // ForeignKey Debtor
  public debtor: Debtor | null = null; // Должник
  public bank_detail_id = 0; // ForeignKey BankDetail
  public bank_detail: BankDetail | null = null; // Детали о банке
  public bank_detail_bik = '';
  public target = PaymentRequestTarget.PAY; // Цель
  public request_type = PaymentRequestType.FORM; // Вид заявки
  public description?: string; // Комментарий заказчика
  public worked_by_id = 0; // в работе у...
  public worked_by: User | null = null; // в работе у...
  public defrayments: Defrayment[] = []; // Перечень платежей в заявке
  public payment_attachments: PaymentAttachment[] = []; // Список файлов вложений к заявке
  public histories: PaymentRequestHistory[] = []; // История обновлений
  public updated_by_id = 0; // Кто обновил запись ID
  public updated_by: User | null = null; // Кто обновил запись
  public doer_comment = ''; // Комментарий исполнителя
  public project_name = '';
  public debtor_name = '';
  public defrayments_count = 0; // Количество платежей
  public updated_by_name = ''; // Юзер, последним обновивший запись
  public worked_by_name = ''; // Юзер, последним обновивший запись
  public project_owner_id = 0; // Ответственный по проекту на котором должник
  constructor(init: Partial<PaymentRequest> = {}) {
    Object.assign(this, init);
  }
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
  PaymentRequestTargetArr.map((i): [string, string] => [i.id, i.ru]),
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
  PaymentRequestTypeArr.map((i): [string, string] => [i.id, i.ru]),
);
