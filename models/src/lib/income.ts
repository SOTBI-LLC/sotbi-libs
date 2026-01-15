import type { SimpleEdit2Model } from './simple-edit';

export interface Income {
  id?: number;
  debtor_id?: number;
  type?: SimpleEdit2Model; // Вид денежного потока
  type_id?: number;
}
