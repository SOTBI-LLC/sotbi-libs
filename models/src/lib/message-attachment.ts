import type { User } from './user';

export interface MessageAttachment {
  id: number;
  message_id: number; // foreign_id запроса на платёж
  file: string; // Системное имя файла
  original_file_name: string; // Оригинальное имя файла
  creator_id: number; // Кто создал запись ID
  creator?: User; // Кто создал запись
}
