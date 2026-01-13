import { BankDetail } from './bankdetail';
import { StatusEnum } from './status-request';
import { User } from './user';

export interface AccountStatement {
  id: number;
  status?: StatusEnum; // статус заявки
  bank_detail_id: number; // Р/сч.
  bank_detail?: BankDetail; // Р/сч.
  bank_account?: string;
  name?: string;
  bank?: string;
  bik?: string;
  project_name?: string;
  debtor_name?: string;
  start: Date; // дата начала
  end: Date; // дата окончания
  request_type: number; // тип запроса (0 - только TXT, 1 - только PDF, 2 - TXT & PDF)
  creator_id: number; // Заказчик ID
  creator?: User; // Заказчик
  creator_name?: string;
  created_at: Date; // Дата заявки
  doer_id: number; // Исполнитель ID
  doer?: User; // Иcполнитель
  doer_name?: string;
  executed_at: Date; // Дата исполнения
  executed_time: Date; // Время исполнения
  pdf_file_name?: string; // ссылка на PDF file
  txt_file_name?: string; // ссылка на TXT file
  excel_file_name?: string; // ссылка на Excel file
  description?: string; // примечание
  request_reason?: string; // причина создания заявки
  reject_reason?: string; // причина отклонения заявки
  duration: number;
  debtor_id?: number;
}
