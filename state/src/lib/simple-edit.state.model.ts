import type { itemMap, SimpleEdit2Model, SimpleEditModel } from '@sotbi/models';

export class SimpleEditStateModel {
  public items: SimpleEditModel[] = [];
  public mapItems: itemMap = new Map();
  public selected: SimpleEditModel | null | undefined = null;
}

export class SimpleEdit2StateModel {
  public items: SimpleEdit2Model[] = [];
  public mapTItems: itemMap = new Map();
  public mapFItems: itemMap = new Map();
  public selected: SimpleEdit2Model | null | undefined = null;
}
