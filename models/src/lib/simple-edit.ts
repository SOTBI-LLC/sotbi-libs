export interface SimpleEditModel {
  id: number | null;
  name: string;
  deleted_at?: Date;
}

export interface SimpleEdit2Model extends SimpleEditModel {
  kind: boolean;
}

export const emptySimpleEdit = { id: null, name: null };
export const emptySimpleEdit2 = { id: null, name: null, kind: false };
