import type { Debtor } from './debtor';
import type { EgrnAttachment } from './egrn-attachment';
import type { Project } from './project';
import type { RealEstate } from './real-estate';
import { StatusEnum } from './status-request';
import type { User } from './user';

export class EgrnRequest {
  public id = 0;
  public debtor_id = 0; // должник
  public debtor: Debtor | null = null; // должник
  public project_id = 0; // проект
  public project: Project | null = null; // проект
  public statement_type: StatementType | null = null; // вид выписки
  public subtype = 0; // подвид выписки
  public start: Date | null = null; // дата начала
  public end: Date | null = null; // дата окончания
  public providing_way: ProvidingWay = ProvidingWay.ELECTRONIC; // способ предоставления
  public status: StatusEnum = StatusEnum.DRAFT; // статус заявки
  public on_behalf_of: OnBehalfOf | null = null; // заказать от имени
  public description: string | null = null; // примечание
  public view_type: ViewType = ViewType.LIST; // вид списка
  public notification: NotificationType = NotificationType.WHOLE; // уведомлять (об исполнении всей/по каждому)
  public thirdperson_name: string | null = null; // наименование третьего лица
  public thirdperson_inn: string | null = null; // ИНН третьего лица
  public rightholder: OnBehalfOf | null = null; // Правообладатель
  public rightholder_name: string | null = null; // Наименование правообладателя
  public fio: string | null = null; // физ лицо - ФИО
  public birthday: Date | null = null; // физ лицо - дата рождения
  public passport: string | null = null; // физ лицо - паспорт
  public passport_date: Date | null = null; // физ лицо - дата выдачи паспорта
  /** физ лицо - Орган, выдавший документ */
  public passport_issued: string | null = null;
  /** физ лицо - Адрес регистрации */
  public registration_address: string | null = null;
  public doer_comment: string | null = null; // комментарий исполнителя
  public request_num: string | null = null; // № запроса для "О правах отдельного лица)
  public key: string | null = null; // ключ запроса для "О правах отдельного лица)
  public receiver_id: number | null = null; // Кто получил документы ID
  public receiver: User | null = null; // то получил документы
  public egrn_attachments: EgrnAttachment[] = []; // массив вложений
  public real_estates: RealEstate[] = []; // массив объектов
  public real_estates_count = 0; // Количество объектов недвижимости
  public cadastral_no: string | null = null;
  public parameters: string | null = null;
  public histories: EgrnRequestHistory[] = []; // История обновлений
  public updated_by_id = 0; // Кто обновил запись ID
  public updated_by: User | null = null; // Кто обновил запись
  public updated_by_name: string | null = null; // Кто обновил запись (name)
  public created_at: Date | null = null; // Дата заявки
  public executed_at: Date | null = null; // Дата исполнения
  public updated_at: Date | null = null; // Дата изменения
  public person_type: PersonType | null = null;

  constructor(init: Partial<EgrnRequest> = {}) {
    Object.assign(this, init);
  }
}

export interface EgrnRequestHistory extends EgrnRequest {
  revision: number;
  action: string;
}

export enum StatementType {
  PERSON = 'person',
  OBJECT = 'object',
}

export const StatementTypeArr: { id: StatementType; ru: string }[] = [
  { id: StatementType.PERSON, ru: '👱‍♂️ О правах отдельного лица' },
  { id: StatementType.OBJECT, ru: '🏭 Об объекте' },
];

export const StatementTypeMap = new Map(
  StatementTypeArr.map((i): [string, string] => [i.id, i.ru]),
);

export enum ProvidingWay {
  ELECTRONIC = 'electronic',
  POST = 'post',
  HANDS = 'hands',
}

export const ProvidingWayArr: { id: ProvidingWay; ru: string }[] = [
  { id: ProvidingWay.ELECTRONIC, ru: '📧 Электронный документ' },
  { id: ProvidingWay.POST, ru: '📨 Бумажный док. (почтой)' },
  { id: ProvidingWay.HANDS, ru: '📄 Бумажный док. (на руки)' },
];

export const ProvidingWayMap = new Map(
  ProvidingWayArr.map((i): [string, string] => [i.id, i.ru]),
);

export enum PersonType {
  ENTITY = 'entity',
  INDIVIDUAL = 'individual',
}

export const PersonTypeArr: { id: PersonType; ru: string }[] = [
  { id: PersonType.ENTITY, ru: 'Юридическое лицо' },
  { id: PersonType.INDIVIDUAL, ru: 'Физическое лицо' },
];

export const PersonTypeMap = new Map(
  PersonTypeArr.map((i): [string, string] => [i.id, i.ru]),
);

export enum OnBehalfOf {
  BANKRUPTCY = 'bankruptcy',
  THIRDPERSON = 'thirdperson',
}

export const OnBehalfOfArr: { id: OnBehalfOf; ru: string }[] = [
  { id: OnBehalfOf.BANKRUPTCY, ru: 'АУ' },
  { id: OnBehalfOf.THIRDPERSON, ru: '3-е лицо' },
];

export const OnBehalfOfMap = new Map(
  OnBehalfOfArr.map((i): [string, string] => [i.id, i.ru]),
);

export const RightholderArr: { id: OnBehalfOf; ru: string }[] = [
  { id: OnBehalfOf.BANKRUPTCY, ru: 'Должник' },
  { id: OnBehalfOf.THIRDPERSON, ru: '3-е лицо' },
];

export const RightholderMap = new Map(
  RightholderArr.map((i): [string, string] => [i.id, i.ru]),
);

export enum ViewType {
  LIST = 'list',
  FILE = 'file',
}
export const ViewTypeArr: { id: ViewType; ru: string }[] = [
  { id: ViewType.LIST, ru: 'Ввести список объектов' },
  { id: ViewType.FILE, ru: 'Приложить файл' },
];

export const ViewTypeMap = new Map(
  ViewTypeArr.map((i): [string, string] => [i.id, i.ru]),
);

export enum NotificationType {
  EVERY = 'every',
  WHOLE = 'whole',
}

export enum SubType1 {
  GENERAL = 1,
  TRANSFERS,
  CONTENT,
  CADASTRAL,
}

export const SubType1Arr: { id: SubType1; ru: string }[] = [
  { id: SubType1.GENERAL, ru: 'Об общих характеристиках' },
  { id: SubType1.TRANSFERS, ru: 'О переходе прав' },
  { id: SubType1.CONTENT, ru: 'О содержании правоустанавливающих документов' },
  { id: SubType1.CADASTRAL, ru: 'О кадастровой стоимости на дату' },
];

export const SubType1Map = new Map(
  SubType1Arr.map((i): [number, string] => [i.id, i.ru]),
);

export enum SubType2 {
  ON_DATE = 1,
  PERIOD,
  FROM_DATE,
  TO_DATE,
}

export const SubType2Arr: { id: SubType2; ru: string }[] = [
  { id: SubType2.ON_DATE, ru: 'На дату' },
  { id: SubType2.PERIOD, ru: 'За период' },
  { id: SubType2.FROM_DATE, ru: 'С даты' },
  { id: SubType2.TO_DATE, ru: 'До даты' },
];

export const SubType2Map = new Map(
  SubType2Arr.map((i): [number, string] => [i.id, i.ru]),
);

// Note: Form interfaces are moved to a separate Angular-specific file
// since they depend on @angular/forms types
