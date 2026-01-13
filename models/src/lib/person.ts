import { SimpleEditModel } from './simple-edit';

export interface Person {
  id?: number;
  debtor_id?: number;
  type?: SimpleEditModel; // Вид представляемых лиц
  type_id?: number;
}
