import { Sro } from './sro';

// Appraiser : Оценщик или Эксперт
export interface Appraiser {
  id: number;
  message_id: number;
  type: number; // 1. Оценщик 2. Эксперт
  name: string; // Имя
  surname: string; // Фамилия
  patronymic_name: string; // Отчество
  inn?: string;
  snils?: string;
  sro?: Sro; // членство в СРО
  sro_id?: number;
}

export enum AppraiserType {
  APPRAISER = 1,
  EXPERT,
}
