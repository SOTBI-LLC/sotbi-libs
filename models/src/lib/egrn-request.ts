import { Debtor } from './debtor';
import { EgrnAttachment, EgrnAttachmentType } from './egrn-attachment';
import { Project } from './project';
import { RealEstate } from './real-estate';
import { StatusEnum } from './status-request';
import { User } from './user';

export interface EgrnRequest {
  id?: number;
  debtor_id?: number; // должник
  debtor?: Debtor; // должник
  project_id?: number; // проект
  project?: Project; // проект
  statement_type: StatementType; // вид выписки
  subtype?: number; // подвид выписки
  start?: Date; // дата начала
  end?: Date; // дата окончания
  providing_way: ProvidingWay; // способ предоставления
  status?: StatusEnum; // статус заявки
  on_behalf_of: OnBehalfOf; // заказать от имени
  description: string; // примечание
  view_type?: ViewType; // вид списка
  notification: NotificationType; // уведомлять (об исполнении всей/по каждому)
  thirdperson_name?: string; // наименование третьего лица
  thirdperson_inn?: string; // ИНН третьего лица
  rightholder?: OnBehalfOf; // Правообладатель
  rightholder_name?: string; // Наименование правообладателя
  fio: string; // физ лицо - ФИО
  birthday: Date; // физ лицо - дата рождения
  passport: string; // физ лицо - паспорт
  passport_date: Date; // физ лицо - дата выдачи паспорта
  doer_comment?: string; // комментарий исполнителя
  request_num?: string; // № запроса для "О правах отдельного лица)
  key?: string; // ключ запроса для "О правах отдельного лица)
  receiver_id?: number; // Кто получил документы ID
  receiver?: User; // то получил документы
  egrn_attachments?: EgrnAttachment[]; // массив вложений
  real_estates?: RealEstate[]; // массив объектов
  real_estates_count?: number; // Количество объектов недвижимости
  cadastral_no?: string;
  parameters?: string;
  histories?: EgrnRequestHistory[]; // История обновлений
  updated_by_id?: number; // Кто обновил запись ID
  updated_by?: User; // Кто обновил запись
  updated_by_name?: string; // Кто обновил запись (name)
  created_at?: Date; // Дата заявки
  executed_at?: Date; // Дата исполнения
  updated_at?: Date; // Дата изменения
  person_type?: PersonType;
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

export const ProvidingWayMap = new Map(ProvidingWayArr.map((i): [string, string] => [i.id, i.ru]));

export enum PersonType {
  ENTITY = 'entity',
  INDIVIDUAL = 'individual',
}

export const PersonTypeArr: { id: PersonType; ru: string }[] = [
  { id: PersonType.ENTITY, ru: 'Юридическое лицо' },
  { id: PersonType.INDIVIDUAL, ru: 'Физическое лицо' },
];

export const PersonTypeMap = new Map(PersonTypeArr.map((i): [string, string] => [i.id, i.ru]));

export enum OnBehalfOf {
  BANKRUPTCY = 'bankruptcy',
  THIRDPERSON = 'thirdperson',
}

export const OnBehalfOfArr: { id: OnBehalfOf; ru: string }[] = [
  { id: OnBehalfOf.BANKRUPTCY, ru: 'АУ' },
  { id: OnBehalfOf.THIRDPERSON, ru: '3-е лицо' },
];

export const OnBehalfOfMap = new Map(OnBehalfOfArr.map((i): [string, string] => [i.id, i.ru]));

export const RightholderArr: { id: OnBehalfOf; ru: string }[] = [
  { id: OnBehalfOf.BANKRUPTCY, ru: 'Должник' },
  { id: OnBehalfOf.THIRDPERSON, ru: '3-е лицо' },
];

export const RightholderMap = new Map(RightholderArr.map((i): [string, string] => [i.id, i.ru]));

export enum ViewType {
  LIST = 'list',
  FILE = 'file',
}
export const ViewTypeArr: { id: ViewType; ru: string }[] = [
  { id: ViewType.LIST, ru: 'Ввести список объектов' },
  { id: ViewType.FILE, ru: 'Приложить файл' },
];

export const ViewTypeMap = new Map(ViewTypeArr.map((i): [string, string] => [i.id, i.ru]));

export enum NotificationType {
  EVERY = 'every',
  WHOLE = 'whole',
}

export enum SubType1 {
  GENERAL,
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

export const SubType1Map = new Map(SubType1Arr.map((i): [number, string] => [i.id, i.ru]));

export enum SubType2 {
  ON_DATE,
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

export const SubType2Map = new Map(SubType2Arr.map((i): [number, string] => [i.id, i.ru]));

// Note: Form interfaces are moved to a separate Angular-specific file
// since they depend on @angular/forms types
