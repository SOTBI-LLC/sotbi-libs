import type { SubMessageType } from './sub-message-type';

/**
 * @exports
 */
export enum MessageTypes {
  /** Сообщение о судебном акте */
  JudgmentNotification = 9,
  /** Уведомление о получении требований кредитора
   *
   * для получения информации через ИНН используем Dadata
   *
   * также в этом типе мы используем creditor-list, где используем [0] элемент массива creditors
   */
  CreditorClaimReceived = 10,
  /** Иное сообщение */
  Another = 11,
  /** Аннулирование ранее опубликованного сообщения */
  CancellationPrior = 12,
  /** Собрания и комитеты кредиторов */
  MeetingsAndCommittees = 13,
  /** Сведения об активах */
  AssetsInformation = 14,
  /** Собрание работников должника */
  EmployeesMeeting = 15,
  /** Оспаривание сделки */
  TransactionChallenging = 16,
  /** Ответственность контролирующих лиц */
  LiabilityControlPersons = 17,
  /** Признаки преднамеренного или фиктивного банкротства */
  FictitiousBankruptcy = 18,
  /** Сообщение о включении заявленных требований в реестр требований кредиторов */
  ClaimInclusionNotice = 19,
  /** Организация и проведение реализации имущества */
  PropertyDisposal = 21,
}

export class MessageType {
  public id = 0;
  public name = '';
  public short = '';
  public sub_message_types: SubMessageType[] = [];
  public deleted_at: Date | null = null;
}
