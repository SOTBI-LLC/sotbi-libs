import { User } from './user';

export interface Defrayment {
  id: number;
  payment_request_id: number; // foreign_id запроса на платёж
  summ: number; // Сумма платежа
  payment_purpose: string; // Назначение платежа (строго 210 символов)
  payment_details?: string; // Реквизиты (один получатель) (текстовое поле)
  file?: string; // Системное имя файла
  original_file_name?: string; // Файл с реквизитами или ПП в формате 1С (один или несколько получателей) (один файл)
  // Нужно, чтобы файл можно было и скачать, и заменить при редактировании
  priority: number; // Очерёдность (цифры 1-5)
  period?: string; // Период (дата, либо только месяц, либо только год)
  creator_id: number; // ID создателя
  creator?: User; // Создатель
  kbk?: string; // Код бюджетной классификации
  okato?: string; // Общероссийский классификатор объектов административно-территориального деления
}
