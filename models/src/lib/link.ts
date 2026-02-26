import type { SimpleEditModel } from './simple-edit';

export class Link {
  public id = 0;
  public uri = '';
  public debtor_id: number | null = null;
  public type: SimpleEditModel | null = null; // -> справочник SimpleEditServiceNames.LINK
  public type_id = 0;
  constructor(data: Partial<Link> = {}) {
    Object.assign(this, data);
  }
}

export interface ShortLink {
  name: string;
  uri: string;
}
