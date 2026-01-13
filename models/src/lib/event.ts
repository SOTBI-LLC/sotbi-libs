export interface StatusEvent {
  id: number;
  status_id: number;
  recipient_type: StatusEventRecipientType; // если не указано - обязательно заполнять конкретных адресатов
  recipients: number[];
  message_template: string;
}

export enum StatusEventRecipientType {
  CREATOR = 'creator', // отправляем автору заявки
  HEAD = 'head', // отправляем руководителю автора заявки
  PERFORMER = 'performer', // отправляем исполнителю
}

export const StatusEventRecipientTypeArr: { id: StatusEventRecipientType; ru: string }[] = [
  { id: StatusEventRecipientType.CREATOR, ru: 'автору заявки' },
  { id: StatusEventRecipientType.HEAD, ru: 'руководителю автора заявки' },
  { id: StatusEventRecipientType.PERFORMER, ru: 'исполнителю' },
];

export const StatusEventRecipientTypeMap = new Map(
  StatusEventRecipientTypeArr.map((i): [string, string] => [i.id, i.ru]),
);
