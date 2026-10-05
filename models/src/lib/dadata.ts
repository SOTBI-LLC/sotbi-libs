export interface Dadata {
  data?: {
    kpp?: string;
    address?: {
      /** Пример: 125364, г Москва, р-н Северное Тушино, ул Свободы, д 61 к 1 */
      unrestricted_value?: string;
      /** Пример: "г Москва, ул Свободы, д 61 к 1" */
      value?: string;
    };
    name?: {
      /** like "СОВРЕМЕННЫЕ ТЕХНОЛОГИИ БИЗНЕСА" */
      full?: string; // like 'ИНКРАУД'
      /** like "ЗАО \"СОТБИ\""
       *
       * используем в MessageTypes.CreditorClaimReceived(message_type_id=10)="Уведомление о получении требований кредитора",
       *
       * используем в MessageTypes.ClaimInclusionNotice(message_type_id=19)="Сообщение о включении заявленных требований в реестр требований кредиторов"
       *
       * используем в AssetsInformation(message_type_id=14)="Сведения об активах" + InformationCreditInstitution(sub_message_type_id=44)="Сведения о кредитной организации, в которой открыт специальный банковский счет должника"
       *
       * используем в TransactionChallenging(message_type_id=16)="Оспаривание сделки" + InvalidationPetition(sub_message_type_id=11)="Заявление о признании сделки должника недействительной" */
      short_with_opf?: string;
    };
    /** // AssetsInformation(message_type_id=14) + InformationCreditInstitution(sub_message_type_id=44) */
    ogrn?: string;
  }; // like {kpp: "380843001", kpp_largest: null, capital: {type: "", value: 0}, invalid: null,…}
  unrestricted_value?: string; // like "БАЙКАЛЬСКИЙ БАНК ПАО СБЕРБАНК"
  value?: string; // like "БАЙКАЛЬСКИЙ БАНК ПАО СБЕРБАНК"
}
