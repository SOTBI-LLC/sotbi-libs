import { PropertyClass } from './property-class';

export interface AppraisalSubject {
  id: number;
  message_id?: number;
  property_class_id?: string;
  property_class?: PropertyClass; // движимое или недвижимое имущество
  description: string; // Описание - в 2 местах используется
  appraisal_date?: Date; // дата определения стоимости
  market_value?: number; // Стоимость, определенная оценщиком,₽
  book_value: number; // Балансовая стоимость,₽ или НАчальная цена - в 2 местах используется
  /* поля для ОРГАНИЗАЦИЯ И ПРОВЕДЕНИЕ РЕАЛИЗАЦИИ ИМУЩЕСТВА => ОБ ОПРЕДЕЛЕНИИ НАЧАЛЬНОЙ ПРОДАЖНОЙ ЦЕНЫ, УТВЕРЖДЕНИИ ПОРЯДКА И УСЛОВИЙ ПРОВЕДЕНИЯ ТОРГОВ ПО РЕАЛИЗАЦИИ ПРЕДМЕТА ЗАЛОГА, ПОРЯДКА И УСЛОВИЙ ОБЕСПЕЧЕНИЯ СОХРАННОСТИ ПРЕДМЕТА ЗАЛОГА */
  lot_number?: number;
}
