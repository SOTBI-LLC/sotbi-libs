import type { AppraisalSubject } from './appraisal-subject';
import type { Appraiser } from './appraiser';
import type { Creditor, CreditorClaimReceived } from './creditor';
import type { Debtor } from './debtor';
import type { MessageAttachment } from './message-attachment';
import type { PostAddress } from './post-address';
import type { SimpleEditModel } from './simple-edit';
import type { StatusEnum } from './status-request';
import type { SubMessageType } from './sub-message-type';
import type { User } from './user';

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
  /** Должник */
  debtor?: Debtor;
  debtor_name: string;
  project_name: string;
  bankruptcy_manager_full_name: string;
  /** Почтовый адрес АУ ID */
  post_address_id: number;
  /** Почтовый адрес АУ */
  post_address?: PostAddress;
  /** Тип сообщения ID */
  message_type_id: number;
  /** Тип сообщения */
  message_type?: SimpleEditModel;
  message_type_name?: string;
  /** Подтип сообщения ID */
  sub_message_type_id?: number;
  /** Подтип сообщения */
  sub_message_type?: SubMessageType;
  sub_message_type_name?: string;
  created_by: string;
  /** Date */
  created_at: string;
  /** Date */
  updated_at: string;
  updated_by: string;
  updated_by_id: number;
  /** Текст */
  description: string;
  /** Комментарии заказчика */
  comments: string;
  /** Комментарии исполнителя */
  doer_comments: string;
  /** Прикрепленные документы */
  message_attachments?: MessageAttachment[];
  /** Только опубликовать */
  is_publish_only?: boolean;
  /** Стоимость публикации */
  cost?: number;
  /** Ссылка на сообщение */
  message_link?: string;
  /** Номер аннулируемой публикации */
  publication_no: number;
  /** Дата публикации */
  publication_at: Date;
  /** Номер публикации (новой) - в секции исполнение заявки */
  publication_num: number;
  /** Где опубликовано (ссылка на сообщение) */
  publication_uri: string;
  /** История обновлений */
  histories?: MessageHistory[];
  /** Для "о завершении реализации имущества" */
  application_by_arbitration_manager_text?: ReleaseCitizenFromObligationsType;

  /** PAYLOAD ЧАСТЬ */
  payload: {
    /*  ОРГАНИЗАЦИЯ И ПРОВЕДЕНИЕ РЕАЛИЗАЦИИ ИМУЩЕСТВА => ОБ ОПРЕДЕЛЕНИИ НАЧАЛЬНОЙ ПРОДАЖНОЙ ЦЕНЫ, УТВЕРЖДЕНИИ ПОРЯДКА И УСЛОВИЙ ПРОВЕДЕНИЯ ТОРГОВ ПО РЕАЛИЗАЦИИ ПРЕДМЕТА ЗАЛОГА, ПОРЯДКА И УСЛОВИЙ ОБЕСПЕЧЕНИЯ СОХРАННОСТИ ПРЕДМЕТА ЗАЛОГА */
    email?: string;
    /** нет на бэке */
    is_expert_report?: boolean;
    /**
     * Дата решения / Дата получения сведений о подаче заявления /
     * Дата следующего судебного заседания
     *
     * Используется для message_type_id = 9 + sub_message_type_id = 32,33,37,38,39,40
     */
    decision_at: Date;
    /**
     * Тип незаконного действия | О признании действий (бездействий) арбитражного управляющего незаконным | О прекращении производства по делу
     *
     * message_type_id = 9 + sub_message_type_id = 33
     */
    illegal_action: string;
    /** Размер убытков / сумма требований / второй очереди
     *
     *  message_type_id = 9 + sub_message_type_id = 33
     *
     * message_type_id = 15 +  sub_message_type_id = 10
     */
    amount: number;
    /**
     * о признании обоснованным заявления о признании гражданина банкротом и введении реструктуризации его долгов
     *
     * message_type_id = 9 + sub_message_type_id = 38,39
     */
    arbitration_manager_type: string;
    /** Оспаривание сделки => Заявление о признании сделки должника недействительной
     *
     *  message_type_id = 9 + sub_message_type_id = 39 *
     *
     *  message_type_id = 9 + sub_message_type_id = 40
     *
     * message_type_id = 15 +  sub_message_type_id = 10
     *
     * message_type_id = 16 +  sub_message_type_id = 11
     */
    application_by_arbitration_manager?: boolean;

    /** Скрывать предыдущее сообщение
     *
     *  message_type_id = 12
     */
    hide_prev_message: boolean;
    /** Тип кредитора: 0.Юр.лицо 1.ИП 2.Физ лицо 3.Иностранная компания
     *
     *  message_type_id = 13 +  sub_message_type_id = 3
     *
     * message_type_id = 15 +  sub_message_type_id = 9
     */
    type: CreditorType | CreditorMeetingType;
    /** Дата/время начала собрания/заседания */
    meeting_start: Date;

    /** Место проведения собрания/заседания
     *
     * /* message_type_id = 13 +  sub_message_type_id = 3
     *
     * message_type_id = 13 +  sub_message_type_id = 5
     *
     * message_type_id = 15 +  sub_message_type_id = 9
     *
     * message_type_id = 15 +  sub_message_type_id = 10
     *
     * message_type_id = 21 */
    meeting_place: string;
    /** Дата/время начала регистрации
     *
     *  message_type_id = 13 +  sub_message_type_id = 3
     */
    register_start: Date;

    /** Дата/время окончания регистрации / приема бюллетеней
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    register_end: Date;
    /** Место регистрации
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    register_place: string;
    /** Место и порядок ознакомления
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    acquaintance_place: string;
    /** Дата ознакомления
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    acquaintance_date: Date;
    /** Комментарии (deprecated?)
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    meeting_comments: string;
    /** Почтовый адрес АУ для направления бюллетеней
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    register_post_address_id: number;

    /** message_type_id = 13 +  sub_message_type_id = 3 */
    register_post_address?: PostAddress;
    /** Web-адрес для проведения электронного собрания
     *
     * message_type_id = 13 +  sub_message_type_id = 3
     */
    web_address: string;
    /** Основания проведения оценки / условия обеспечения сохранности залога
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     *
     * message_type_id = 21
     */
    assessment_ground: string;
    /** Номер отчета об оценке
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     */
    evaluation_report_no: string;
    /** Дата отчета об оценке
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     */
    evaluation_report_date: Date;
    /** Номер экспертизы отчета об оценке
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     *
     * is_expert_report = true если expert_report_no существует
     */
    expert_report_no: string;
    /** Дата экспертизы отчета об оценке
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     */
    expert_report_date: Date;
    /** Оценщик и Эксперт (если привлекался)
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     */
    appraisers: Appraiser[];
    /** поле на фронте, Эксперты (выделены из appraisers)
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     */
    experts?: Appraiser[];
    /** Отчет об оценке|Экспертиза отчета об оценке --- aka lots в ОРГАНИЗАЦИЯ И ПРОВЕДЕНИЕ РЕАЛИЗАЦИИ ИМУЩЕСТВА => ОБ ОПРЕДЕЛЕНИИ НАЧАЛЬНОЙ ПРОДАЖНОЙ ЦЕНЫ, УТВЕРЖДЕНИИ ПОРЯДКА И УСЛОВИЙ ПРОВЕДЕНИЯ ТОРГОВ ПО РЕАЛИЗАЦИИ ПРЕДМЕТА ЗАЛОГА, ПОРЯДКА И УСЛОВИЙ ОБЕСПЕЧЕНИЯ СОХРАННОСТИ ПРЕДМЕТА ЗАЛОГА
     *
     * message_type_id = 14 +  sub_message_type_id = 8
     *
     * message_type_id = 21
     */
    appraisal_subjects: AppraisalSubject[];
    /** Кредитная организация + credit_organisation.inn => Dadata используем тут
     *
     * message_type_id = 14 +  sub_message_type_id = 44
     */
    credit_organisation?: CreditOrganisation;
    /** Повестка дня собрания
     *
     * message_type_id = 15 +  sub_message_type_id = 9
     */
    meeting_agenda: string;
    /**
     * Количество присутствовавших работников (бывших работников).
     *
     * Сведения о решениях, принятых собранием работников, бывших работников должника.
     *
     * message_type_id = 15 +  sub_message_type_id = 10
     */
    present_workers_count: number;
    /** Дата получения - требований кредиторов|сведений о проведении собрания|Дата подачи заявления | Дата включения в реестр(MessageTypes.ClaimInclusionNotice, 19)
     *
     *  message_type_id = 16 +  sub_message_type_id = 11, 12, 13
     *
     * message_type_id = 19
     */
    receiving_at: Date;
    /** Кредиторы - сообщение о включении заявленных требований в реестр требований кредиторов 
     * 
     * используется в 
    MessageTypes.ClaimInclusionNotice (message_type_id = 19) &&

    MessageTypes.TransactionChallenging(message_type_id = 16) + SubMessageTypes.InvalidationPetition (sub_message_type_id = 11) &&

    MessageTypes.LiabilityControlPersons(message_type_id = 17) + SubMessageTypes.LiabilityClaim (sub_message_type_id = 14) &&

    MessageTypes.LiabilityControlPersons(message_type_id = 17) + SubMessageTypes.SubsidiaryLiabilityClaim (sub_message_type_id = 17) &&

    MessageTypes.TransactionChallenging(message_type_id = 16) + SubMessageTypes.ResultsReviewApplicationsChallengingTransactions(sub_message_type_id = 45) 
    */
    creditors: Creditor[];
    /** Уведомление о получении требований кредитора
     *
     *  message_type_id = 19
     */
    creditors_claim_received: CreditorClaimReceived[];
    /** поле на фронте, для выделения иных лиц(type=2) из creditors /* <- Уведомление о получении требований кредитора ->
     *
     * message_type_id = 16 +  sub_message_type_id = 11
     */
    other_persons: Creditor[];
    /** Признаки преднамеренного банкротства: 1. выявлены 2. не выявлены 3. проверка не проведена.
     *
     * Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства.
     *
     * message_type_id = 18 +  sub_message_type_ids = 22, 24
     */
    deliberate: DeliberateOrFictitiousValue;
    /** Признаки фиктивного банкротства: 1. выявлены 2. не выявлены 3.проверка не проведена /* <- Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства ->
     *
     * message_type_id = 18 +  sub_message_type_ids = 22, 24
     */
    fictitious: DeliberateOrFictitiousValue;
    /** Признаки преднамеренного банкротства: причина // Причина отмены плана реструктуризации (39 ID) // Освобождение гражданина от обязательств(причина, ID 40) /* <- Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства ->
     *
     * message_type_id = 18 +  sub_message_type_ids = 22, 24
     */
    deliberate_reason: string;
    /**Признаки фиктивного банкротства: причина /* <- Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства ->
     *
     * message_type_id = 18 +  sub_message_type_ids = 22, 24
     */
    fictitious_reason: string;
    /** Финансовые санкции /* Сообщение о включении заявленных требований в реестр требований кредиторов = NotificationInclusionClaims
     *
     * message_type_id = 19
     */
    amount_financial_sanctions: number;
    /**
     * Сумма заявленных требований.
     *
     * Сообщение о включении заявленных требований в реестр требований кредиторов = NotificationInclusionClaims.
     *
     * message_type_id = 19
     */
    amount_stated_claims: number;
    /** Задолженность по заработной плате и/или выходному пособию /* Сообщение о включении заявленных требований в реестр требований кредиторов = NotificationInclusionClaims
     *
     * message_type_id = 19
     */
    delay_salary: boolean;
    /** Очередность удолетворения /* Сообщение о включении заявленных требований в реестр требований кредиторов = NotificationInclusionClaims
     *
     * message_type_id = 19
     */
    order_of_satisfaction: TypeOrderOfSatisfaction;
    /** Обеспечение залогом /* Сообщение о включении заявленных требований в реестр требований кредиторов = NotificationInclusionClaims
     *
     * message_type_id = 19
     */
    providing_collateral: ProvidingCollateral;
    /**message_type_id = 16("Оспаривание сделки"), sub_message_type_id = 11 ("Заявление о признании сделки должника недействительной")  */
    there_is_no_price: boolean;
    /** Основания для оспаривания сделки */
    basis_for_challenging_the_transaction: BasisForChallengingTransaction;
    tax_id: string;
    name_of_company: string;
    /** Оспаривание сделки (message_type_id: 16) => Результаты рассмотрения/пересмотра заявлений об оспаривании сделок (sub_message_type_id: 45) }*/
    notice_application_not_published: boolean;
    result_options: ResultOptions;
    result_options_comment: string;
    /** Сумма удовлетворения, руб. */
    amount_of_satisfaction: number;
    /** Сумма отсутствует */
    there_is_no_amount_of_satisfaction: boolean;
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
  CreditorTypeArr.map((i): [number, string] => [i.id, i.ru]),
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
  DeliberateOrFictitiousValueArr.map((i): [number, string] => [i.id, i.ru]),
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

export enum BasisForChallengingTransaction {
  FIRST = 'п.1. ст. 61.2 ФЗ 127',
  SECOND = 'п.2. ст. 61.2 ФЗ 127',
  THIRD = 'п.2. ст. 61.3 ФЗ 127',
  FOURTH = 'п.3. ст. 61.3 ФЗ 127',
  FIFTH = 'ст. 10 и ст. 168 ГК РФ',
  SIXTH = 'Иное',
}

export enum ResultOptions {
  FIRST = 'Заявление об оспаривании сделки удовлетворено',
  SECOND = 'Заявление  об оспаривании сделки удовлетворено частично',
  THIRD = 'В удовлетворении заявления об оспаривании сделки отказано',
  FOURTH = 'Заявление об оспаривании сделки остановлено без рассмотрения',
  FIFTH = 'Производство прекращено',
  SIXTH = 'Заявление направлено на новое рассмотрение',
  SEVENTH = 'Иное',
}

export interface RequestPublicationsBySubMessageIdAndDebtorId {
  subMessageId: number;
  debtorId: number;
}

export interface PublicationBySubMsgAndDebtor {
  id: number;
  publication_at: Date;
  publication_num: number;
}
// Note: Form interfaces (PayloadForm, MessageForm, etc.) are moved to a separate
// Angular-specific file since they depend on @angular/forms types
