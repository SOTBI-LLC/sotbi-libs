import type { CreditorType } from '..';

// Creditor : Кредитор | Участник сделки | Контролирующее должника лицо
export interface Creditor {
  id: number;
  message_id: number;
  /** CreditorType ===  0=ЮЛ/1=ИП/2=ФЛ/3=иностранная компания
   *
   * CreditorResidentType === 0=Резидент 1=Нерезидент 2=Иное лицо */
  type: CreditorType | CreditorResidentType;
  tax_id: string; // ИНН | ОГРНИП | СНИЛС | TaxID
  name: string; // ФИО | Company Name
  tax_type: string; // Тип идентифицирующего номера | Тип привлекаемого лица
  country: string; // страна foreign company
  amount: number; // Размер ответственности"`
  claim_grounds: string; // Основание возникновения требования
}

export interface CreditorClaimReceived {
  id: number;
  receiving_at: Date; // Дата получения требований кредитора
  amount: number; // Сумма требований
  type: number; // Кредитор: ЮЛ/ИП/ФЛ/иностранная компания
  tax_id: string; // 'ИНН/ОГРНИП/СНИЛС' || 'ИНН/ОГРН' || 'ИНН/ОГРНИП' || 'ИНН/СНИЛС' || Идентифицирующий номер
  name: string; // ФИО/Наименование компании
  country: string; // Страна
  tax_type: string; // Тип идентифицирующего номера
  claim_grounds: string; // Основание возникновения требования
}

export enum CreditorResidentType {
  UNSPECIFIED,
  NON_RESIDENT,
  RESIDENT,
  OTHER_PERSON,
}

export enum CreditorListType {
  UNSPECIFIED,
  PARTNERS_DEAL,
  CONTROLLING_PERSONS_DEBTOR,
  OTHER_PERSONS,
}
