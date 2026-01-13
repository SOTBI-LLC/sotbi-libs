import { SimpleEditModel } from './simple-edit';

export interface Asset {
  id?: number;
  debtor_id?: number;
  type?: SimpleEditModel; // Виды ценного имущества
  type_id?: number; //       ID Вида ценного имущества
}
