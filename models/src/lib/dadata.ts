export interface Dadata {
  data?: {
    kpp?: string;
    name?: {
      full?: string; // like 'ИНКРАУД'
      short_with_opf?: string; // like 'ООО 'ИНКРАУД' + используем в MessageTypes.CreditorClaimReceived и SubMessageTypes.InformationCreditInstitution
    };
    ogrn?: string; // используем в SubMessageTypes.InformationCreditInstitution
  }; // like {kpp: "380843001", kpp_largest: null, capital: {type: "", value: 0}, invalid: null,…}
  unrestricted_value?: string; // like "БАЙКАЛЬСКИЙ БАНК ПАО СБЕРБАНК"
  value?: string; // like "БАЙКАЛЬСКИЙ БАНК ПАО СБЕРБАНК"
}
