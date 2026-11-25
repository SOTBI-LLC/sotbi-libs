import type { Sro } from './sro';

export interface SaveAppraiserRequest {
  surname: string;
  name: string;
  patronymic_name: string | null;
  inn: string;
  snils: string;
  sro_id: number;
}

export interface CatalogAppraiser extends Omit<
  SaveAppraiserRequest,
  'patronymic_name'
> {
  id: number;
  patronymic_name?: string;
  sro?: Sro;
}
