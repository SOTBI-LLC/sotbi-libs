import { SimpleEdit2Model } from './simple-edit';

export interface Expense {
  id?: number;
  debtor_id?: number;
  type?: SimpleEdit2Model; // Вид денежного потока
  type_id?: number;
}
