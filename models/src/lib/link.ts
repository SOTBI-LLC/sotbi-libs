import { SimpleEditModel } from './simple-edit';

export interface Link {
  id?: number;
  uri?: string;
  debtor_id?: number;
  type?: SimpleEditModel; // -> справочник SimpleEditServiceNames.LINK
  type_id?: number;
}

export interface ShortLink {
  name: string;
  uri: string;
}
