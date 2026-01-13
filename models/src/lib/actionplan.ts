import { SimpleEdit2Model } from './simple-edit';

export interface ActionPlan {
  id: number;
  type?: SimpleEdit2Model; // Планируемые процедуры
  type_id?: number;
  debtor_id?: number;
  start?: Date; //            Плановая дата начала
  end?: Date; //              Плановая дата окончания
  lawyer_count: number; //    Среднее количество задействованных юристов
  avg_load: number; //        Средняя нагрузка на одного юриста (1-5)
}
