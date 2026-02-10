export interface SimpleEditModel {
  id: number;
  name: string;
  deleted_at?: Date;
}

export interface SimpleEdit2Model extends SimpleEditModel {
  kind: boolean;
}

export const emptySimpleEdit = { id: 0, name: '' };
export const emptySimpleEdit2 = { id: 0, name: '', kind: false };
