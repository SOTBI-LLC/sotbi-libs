export interface Property {
  id: number;
  type: boolean; //           Наличие залога
  debtor_id: number; //       ID должника
  pledgee?: string; //        Залогодержатель
  accompanied?: boolean; //   Спровождаемый кредитор/залогодержатель
  description?: string; //    Краткий состав залога
  comment?: string; //        Комментарий
  predicted_cost?: number; // Прогнозируемая реальная стоимость
  inventory_date?: Date; //   Плановая дата окончания инвентаризации
  appraisal_date?: Date; //   Плановая дата окончания оценки
  sale_date?: Date; //        Плановая дата окончания продажи
}
