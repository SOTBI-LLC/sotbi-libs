export enum SubMessageTypes {
  /** Сообщение о собрании кредиторов */
  CreditorsMeeting = 3,
  /** Сообщение о результатах проведения собрания кредиторов */
  CreditorsDecision = 4,
  /** Уведомление о проведении комитета кредиторов */
  CreditorsCommittee = 5,
  /** Сообщение о результатах проведения комитета кредиторов */
  CommitteeDecision = 6,
  /** Сведения о результатах инвентаризации имущества должника */
  InventoryReport = 7,
  /** Отчет оценщика об оценке имущества должника */
  AppraiserReport = 8,
  /** Уведомление о проведении собрания работников, бывших работников должника */
  NotificationEmployeeMeet = 9,
  /** Сведения о решениях, принятых собранием работников, бывших работников должника */
  EmployeeMeetDecisions = 10,
  /** Заявление о признании сделки должника недействительной */
  InvalidationPetition = 11,
  /** Судебный акт по результатам рассмотрения заявления об оспаривании сделки должника */
  TransactionChallengeRuling = 12,
  /** Судебный акт по результатам пересмотра рассмотрения заявления об оспаривании сделки должника */
  TransactionReviewRuling = 13,
  /** Заявление о привлечении контролирующих должника лиц, а также иных лиц, к ответственности в виде возмещения убытков */
  LiabilityClaim = 14,
  /** Судебный акт по результатам рассмотрения заявления о привлечении контролирующих должника лиц, а также иных лиц, к ответственности в виде возмещения убытков */
  CompensationOrder = 15,
  /** Судебный акт по результатам пересмотра рассмотрения заявления о привлечении контролирующих должника лиц, а также иных лиц, к ответственности в виде возмещения убытков */
  CourtRuling = 16,
  /** Заявление о привлечении контролирующих должника лиц к субсидиарной ответственности */
  SubsidiaryLiabilityClaim = 17,
  /** Судебный акт по результатам рассмотрения заявления о привлечении контролирующих должника лиц к субсидиарной ответственности */
  SubsidiaryLiabilityRuling = 18,
  /** Судебный акт по результатам пересмотра рассмотрения заявления о привлечении контролирующих должника лиц к субсидиарной ответственности */
  RevisedCourtRuling = 19,
  /** Сообщение о праве кредитора выбрать способ распоряжения правом требования о привлечении к субсидиарной ответственности */
  CreditorChoice = 20,
  /** Предложение о присоединении к заявлению о привлечении контролирующих лиц должника к субсидиарной ответственности */
  JoiningApplication = 21,
  /** Сообщение о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства */
  FictitiousBankruptcy = 22,
  /** Сообщение об отмене сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства */
  CancellationNotice = 23,
  /** Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства */
  AmendmentNotice = 24,
  /** о введении наблюдения */
  CommencementObservation = 25,
  /** о введении внешнего управления */
  NoticeReceivership = 26,
  /** о введении финансового оздоровления */
  FinancialRehabilitation = 27,
  /** о признании должника банкротом и открытии конкурсного производства */
  BankruptcyDeclared = 28,
  /** о завершении конкурсного производства */
  BankruptcyCompletion = 29,
  /** об утверждении арбитражного управляющего */
  AdministratorAppointment = 30,
  /** об освобождении или отстранении арбитражного управляющего */
  TrusteeRemoval = 31,
  /** о признании действий (бездействий) арбитражного управляющего незаконными */
  InvalidActionsRuling = 32,
  /** о взыскании с арбитражного управляющего убытков в связи с неисполнением или ненадлежащим исполнением своих обязанностей */
  DamagesClaim = 33,
  /** об удовлетворении заявлений третьих лиц о намерении погасить обязательства должника */
  ThirdPartyClaimSatisfaction = 34,
  /** другой судебный акт */
  Another = 35,
  /** об определении начальной продажной цены, утверждении порядка и условий проведения торгов по реализации предмета залога, порядка и условий обеспечения сохранности предмета залога */
  DeterminationSalePrice = 36,
  /** о прекращении производства по делу */
  TerminationProceedings = 37,
  /** о признании обоснованным заявления о признании гражданина банкротом и введении реструктуризации его долгов */
  ValidatingBankruptcyApplication = 38,
  /** о признании гражданина банкротом и введении реализации имущества гражданина */
  DeclaringBankruptcy = 39,
  /** о завершении реализации имущества */
  PropertyRealization = 40,
  /** Сведения о кредитной организации, в которой открыт специальный банковский счет должника, message_type=14=Сведения об активах:
   * используется тут Dadata => вбили ИНН, получили Наименование+ОГРН
   */
  InformationCreditInstitution = 44,
  /** Результаты рассмотрения/пересмотра заявлений об оспаривании сделок message_type=16=Оспаривание сделки*/
  ResultsReviewApplicationsChallengingTransactions = 45,
}

export const SubsidiaryAndLiabilityClaim =
  (1n << BigInt(SubMessageTypes.LiabilityClaim)) |
  (1n << BigInt(SubMessageTypes.SubsidiaryLiabilityClaim));

export const FictitiousBankruptcyAndAmendmentNotice =
  (1n << BigInt(SubMessageTypes.FictitiousBankruptcy)) |
  (1n << BigInt(SubMessageTypes.AmendmentNotice));

/**
 * Судебный акт по результатам рассмотрения заявления об оспаривании сделки должника 12
 *
 * Судебный акт по результатам пересмотра рассмотрения заявления об оспаривании сделки должника 13
 *
 * Сообщение о праве кредитора выбрать способ распоряжения правом требования о привлечении к субсидиарной ответственности 20
 *
 * Сообщение об отмене сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства 23
 *
 * Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства 24
 * */
export const TransactionAndCreditorAndNotice =
  (1n << BigInt(SubMessageTypes.TransactionChallengeRuling)) |
  (1n << BigInt(SubMessageTypes.TransactionReviewRuling)) |
  (1n << BigInt(SubMessageTypes.CreditorChoice)) |
  (1n << BigInt(SubMessageTypes.CancellationNotice)) |
  (1n << BigInt(SubMessageTypes.AmendmentNotice));

/**
 * Судебный акт по результатам рассмотрения заявления о привлечении контролирующих должника лиц, а также иных лиц, к ответственности в виде возмещения убытков 15
 *
 * Судебный акт по результатам пересмотра рассмотрения заявления о привлечении контролирующих должника лиц, а также иных лиц, к ответственности в виде возмещения убытков 16
 *
 * Судебный акт по результатам рассмотрения заявления о привлечении контролирующих должника лиц к субсидиарной ответственности 18
 *
 * Судебный акт по результатам пересмотра рассмотрения заявления о привлечении контролирующих должника лиц к субсидиарной ответственности 19
 *
 * Предложение о присоединении к заявлению о привлечении контролирующих лиц должника к субсидиарной ответственности 21
 */
export const CompensationAndRuling =
  (1n << BigInt(SubMessageTypes.CompensationOrder)) |
  (1n << BigInt(SubMessageTypes.CourtRuling)) |
  (1n << BigInt(SubMessageTypes.SubsidiaryLiabilityRuling)) |
  (1n << BigInt(SubMessageTypes.RevisedCourtRuling)) |
  (1n << BigInt(SubMessageTypes.JoiningApplication));

/**
 * Судебный акт по результатам рассмотрения заявления об оспаривании сделки должника 12
 *
 * Судебный акт по результатам пересмотра рассмотрения заявления об оспаривании сделки должника 13
 *
 * Сообщение об отмене сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства 23
 *
 * Сообщение об изменении сообщения о наличии или об отсутствии признаков преднамеренного или фиктивного банкротства 24
 */
export const TransactionAndNotice =
  (1n << BigInt(SubMessageTypes.TransactionChallengeRuling)) |
  (1n << BigInt(SubMessageTypes.TransactionReviewRuling)) |
  (1n << BigInt(SubMessageTypes.CancellationNotice)) |
  (1n << BigInt(SubMessageTypes.AmendmentNotice));

export const InformationCreditInstitution =
  1n << BigInt(SubMessageTypes.InformationCreditInstitution);

export const informationCreditInstitutionOrResultsReviewApplicationsChallengingTransactions =
  InformationCreditInstitution |
  (1n <<
    BigInt(SubMessageTypes.ResultsReviewApplicationsChallengingTransactions));

export class SubMessageType {
  public id = 0;
  public name = '';
  public short = '';
  public message_type_id = 0;
  public deleted_at: Date | null = null;
}
