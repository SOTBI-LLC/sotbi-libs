import { AppraisalSubject } from './appraisal-subject';
import { Appraiser } from './appraiser';
import { Creditor } from './creditor';
import { Debtor } from './debtor';
import { MessageAttachment } from './message-attachment';
import { PostAddress } from './post-address';
import { SimpleEditModel } from './simple-edit';
import { StatusEnum } from './status-request';
import { SubMessageType } from './sub-message-type';
import { User } from './user';

/**
 * Type for Release Citizen From Obligations.
 * Moved from @root/requests/efrsb-message/efrsb-message.common for framework-agnostic usage.
 */
export enum ReleaseCitizenFromObligationsType {
  TRUE = 'Применяется',
  FALSE = 'Не применяется',
}

export interface Message {
  id: number;
  status: StatusEnum;
  debtor_id: number;
  debtor?: Debtor; // должник
  debtor_name: string;
  project_name: string;
  bankruptcy_manager_full_name: string;
  post_address_id: number; // почтовый адрес АУ ID
  post_address?: PostAddress; // почтовый адрес АУ
  message_type_id: number; // тип сообщения ID
  message_type?: SimpleEditModel; // тип
  message_type_name?: string;
  sub_message_type_id?: number; // подтип сообщения ID
  sub_message_type?: SubMessageType; // подтип сообщения
  sub_message_type_name?: string;
  created_by: string;
  created_at: string; // Date
  updated_at: string; // Date
  updated_by: string;
  updated_by_id: number;
  description: string; // текст
  comments: string; // комментарии заказчика
  doer_comments: string; // комментарии исполнителя
  message_attachments?: MessageAttachment[]; // Прикрепленные документы
  is_publish_only?: boolean; // Только опубликовать
  cost?: number; // стоимость публикации
  message_link?: string;
  publication_no: number; // Номер аннулируемой публикации
  publication_at: Date; // Дата публикации
  publication_num: number; // Номер публикации (новой) - в секции исполнение заявки
  publication_uri: string; // Где опубликовано (ссылка на сообщение)
  histories?: MessageHistory[]; // История обновлений
  /** для "о завершении реализации имущества" */
  application_by_arbitration_manager_text?: ReleaseCitizenFromObligationsType;
  /*  ОРГАНИЗАЦИЯ И ПРОВЕДЕНИЕ РЕАЛИЗАЦИИ ИМУЩЕСТВА => ОБ ОПРЕДЕЛЕНИИ НАЧАЛЬНОЙ ПРОДАЖНОЙ ЦЕНЫ, УТВЕРЖДЕНИИ ПОРЯДКА И УСЛОВИЙ ПРОВЕДЕНИЯ ТОРГОВ ПО РЕАЛИЗАЦИИ ПРЕДМЕТА ЗАЛОГА, ПОРЯДКА И УСЛОВИЙ ОБЕСПЕЧЕНИЯ СОХРАННОСТИ ПРЕДМЕТА ЗАЛОГА */
  email?: string;
  /* PAYLOAD ЧАСТЬ */
  payload: {
    is_expert_report?: boolean; // нет на бэке
    decision_at: Date;
    illegal_action: string;
    amount: number;
    arbitration_manager_type: string;
    application_by_arbitration_manager?: boolean;
    hide_prev_message: boolean;
    type: number;
    meeting_start: Date;
    meeting_place: string;
    register_start: Date;
    register_end: Date;
    register_place: string;
    acquaintance_place: string;
    acquaintance_date: Date;
    meeting_comments: string;
    register_post_address_id: number;
    register_post_address?: PostAddress;
    web_address: string;
    assessment_ground: string;
    evaluation_report_no: string;
    evaluation_report_date: Date;
    expert_report_no: string;
    expert_report_date: Date;
    appraisers: Appraiser[];
    experts?: Appraiser[];
    appraisal_subjects: AppraisalSubject[];
    credit_organisation?: CreditOrganisation;
    meeting_agenda: string;
    present_workers_count: number;
    receiving_at: Date;
    creditors: Creditor[];
    other_persons: Creditor[];
    deliberate: number;
    fictitious: number;
    deliberate_reason: string;
    fictitious_reason: string;
    amount_financial_sanctions: number;
    delay_salary: boolean;
    order_of_satisfaction: TypeOrderOfSatisfaction;
    providing_collateral: ProvidingCollateral;
  };
}

export interface CreditOrganisation {
  name: string;
  inn: string;
  ogrn: string;
  bik: string;
}

export enum CreditorType {
  LEGAL_PERSON,
  INDIVIDUAL_BUSINESSMAN,
  PRIVATE_PERSON,
  FOREIGN_COMPANY,
}

export const CreditorTypeArr: { id: CreditorType; ru: string }[] = [
  { id: CreditorType.LEGAL_PERSON, ru: 'ЮЛ' },
  { id: CreditorType.INDIVIDUAL_BUSINESSMAN, ru: 'ИП' },
  { id: CreditorType.PRIVATE_PERSON, ru: 'ФЛ' },
  { id: CreditorType.FOREIGN_COMPANY, ru: 'иностранная компания' },
];

export const CreditorTypeMap = new Map(
  CreditorTypeArr.map((i): [number, string] => [i.id, i.ru])
);

export enum CreditorMeetingType {
  IN_PERSON,
  ABSENTEE,
  ELECTRONIC,
}

export interface MessageHistory {
  created_at: Date;
  debtor: Debtor;
  debtor_id: number;
  id: number;
  message_type: SimpleEditModel;
  message_type_id: number;
  post_address: PostAddress;
  post_address_id: number;
  status_id: number;
  sub_message_type: SubMessageType;
  updated_by: User;
  updated_by_id: number;
  status: StatusEnum;
}

export enum DeliberateOrFictitiousValue {
  PRESENCE_OF_SIGNS_WAS_REVEALED = 1,
  PRESENCE_OF_SIGNS_WAS_NOT_REVEALED,
  CHECK_WAS_NOT_CARRIED_OUT_FOR_THE_REASON,
}

export const DeliberateOrFictitiousValueArr: {
  id: DeliberateOrFictitiousValue;
  ru: string;
}[] = [
  {
    id: DeliberateOrFictitiousValue.PRESENCE_OF_SIGNS_WAS_REVEALED,
    ru: 'Выявлено наличие признаков',
  },
  {
    id: DeliberateOrFictitiousValue.PRESENCE_OF_SIGNS_WAS_NOT_REVEALED,
    ru: 'Не выявлено наличие признаков',
  },
  {
    id: DeliberateOrFictitiousValue.CHECK_WAS_NOT_CARRIED_OUT_FOR_THE_REASON,
    ru: 'Проверка не проведена по причине',
  },
];

export const DeliberateOrFictitiousValueMap = new Map(
  DeliberateOrFictitiousValueArr.map((i): [number, string] => [i.id, i.ru])
);

export enum TypeOrderOfSatisfaction {
  FIRST_QUEUE = '1 очередь',
  SECOND_QUEUE = '2 очередь',
  THIRD_QUEUE = '3 очередь',
  FOUTRH_QUEUE = '4 очередь',
  BEHIND_REGISTRY = 'За реестром',
  OTHER = 'Иное',
}

export enum ProvidingCollateral {
  YES = 'Да',
  NO = 'Нет',
  PARTLY = 'Частично',
}

// Note: Form interfaces (PayloadForm, MessageForm, etc.) are moved to a separate
// Angular-specific file since they depend on @angular/forms types
