import { SimpleEditModel } from './simple-edit';

export interface Target {
  id: number;
  debtor_id: number;
  type: SimpleEditModel; // Вид поставленной цели
  type_id: number;
}
