export interface Sro {
  id: number;
  name: string;
  full_name?: string;
  date?: Date;
  inn?: string;
  ogrn?: string;
  address?: string;
  jur_address?: string;
  post_address?: string;
  phone?: string;
  email?: string;
  site?: string;
  uri?: string; // Ссылка на ЕФРСБ
  sro_type?: SroType;
}

export enum SroType {
  ARBITRATION = 'arbitration',
  VALUER = 'valuer',
}

export const SroTypeArr: { id: SroType; ru: string }[] = [
  { id: SroType.ARBITRATION, ru: 'АУ' },
  { id: SroType.VALUER, ru: 'Оценщиков' },
];

export const SroTypeMap = new Map(SroTypeArr.map((i): [string, string] => [i.id, i.ru]));
