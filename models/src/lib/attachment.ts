import type { Advert } from './advert';
import type { Calculation, TradingCode } from './bidcode';
import type { SimpleEditModel } from './simple-edit';
import type { User } from './user';

export interface Attachment {
  id: number;
  taskListId?: number;
  attachmentType?: SimpleEditModel;
  attachmentTypeId: number; //     required, Раздел
  trading_code?: TradingCode;
  trading_code_id: number; //       required, Код торгов
  organisation?: Advert;
  organisation_id?: number;
  adNum: string; //                required, Номер объявления
  adDate: Date; //                 required, Дата объявления
  costs: number; //                required, Сумма
  originalFileName: string; //    required, Имя исходного файла
  file: string; //                required, Файл
  comment?: string;
  /** correct true = учитывать чекбокс = !this.isBankruptcy = не АУ */
  correct: boolean; //            required, Учитывать в затратах
  creator?: User;
  creator_id?: number;
  calculation_id?: number;
  calculation?: Calculation;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AttachmentHistory extends Attachment {
  action: string;
  revision: number;
  dt_datetime: Date;
  updated_by: number;
}
