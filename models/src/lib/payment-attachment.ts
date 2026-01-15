import type { IAttachment } from './egrn-attachment';
import type { User } from './user';

export interface PaymentAttachment extends IAttachment {
  type: PaymentAttachmentType;
  payment_request_id: number;
  creator_id: number;
  creator?: User;
}

export enum PaymentAttachmentType {
  REQUEST = 'request', // файлы для исполнителя
  ORDERS = 'orders', // платежные поручения
  WRITINGOUT = 'writingout', // выписки
  CARDFILE = 'cardfile', // картотека
  OTHER = 'other', // файлы для заказчика
}

export const PaymentAttachmentTypeArr: {
  id: PaymentAttachmentType;
  ru: string;
}[] = [
  { id: PaymentAttachmentType.REQUEST, ru: 'Заявка' },
  { id: PaymentAttachmentType.ORDERS, ru: 'Платежные поручения' },
  { id: PaymentAttachmentType.WRITINGOUT, ru: 'Выписка' },
  { id: PaymentAttachmentType.CARDFILE, ru: 'Картотека' },
  { id: PaymentAttachmentType.OTHER, ru: 'Другое' },
];

export const PaymentAttachmentTypeMap = new Map(
  PaymentAttachmentTypeArr.map((i): [string, string] => [i.id, i.ru])
);
