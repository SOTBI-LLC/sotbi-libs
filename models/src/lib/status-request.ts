export enum StatusEnum {
  AGREED = 'agreed',
  APPROVAL = 'approval',
  CARDFILE = 'cardfile',
  DRAFT = 'draft',
  DONE = 'done',
  FUTURE = 'future',
  OPEN = 'open',
  OTHER = 'other',
  REJECT = 'reject',
  REQUEST = 'request',
  SEND = 'send',
  WAITING = 'waiting',
  WITHDRAW = 'withdraw',
  WORK = 'work',
}

export const StatusArr: { id: StatusEnum; ru: string }[] = [
  { id: StatusEnum.AGREED, ru: 'Согласовано' },
  { id: StatusEnum.APPROVAL, ru: 'На согласовании' },
  { id: StatusEnum.CARDFILE, ru: 'Поставлено в картотеку' },
  { id: StatusEnum.DONE, ru: 'Исполнена' },
  { id: StatusEnum.DRAFT, ru: 'Черновик' },
  { id: StatusEnum.FUTURE, ru: 'Будущая' },
  { id: StatusEnum.OPEN, ru: 'Открыта' },
  { id: StatusEnum.OTHER, ru: 'Иной результат' },
  { id: StatusEnum.REJECT, ru: 'Отклонена' },
  { id: StatusEnum.REQUEST, ru: 'Запрошено' },
  { id: StatusEnum.SEND, ru: 'Отправлено в банк' },
  { id: StatusEnum.WAITING, ru: 'Ожидание' },
  { id: StatusEnum.WITHDRAW, ru: 'Отозвана' },
  { id: StatusEnum.WORK, ru: 'В работе' },
];

export const StatusMap = new Map(StatusArr.map((i): [string, string] => [i.id, i.ru]));

export enum RequestTypeEnum {
  ACCOUNT_STATEMENT = 'account_statement', // Заявки на выписки
  PAYMENTS = 'payments', // Заявки на платежи
  EGRN = 'egrn', // Заявки на ЕГРН
  EFRSB = 'efrsb', // Заявки на ЕФРСБ
}

export interface StatusRequest {
  id?: number;
  name?: string;
  status?: StatusEnum;
  type?: RequestTypeEnum;
  createdAt?: Date;
  updatedAt?: Date;
}
