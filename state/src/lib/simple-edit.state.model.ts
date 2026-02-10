import type { SimpleEdit2Model, SimpleEditModel } from '@sotbi/models';

export type itemMap = Map<number, string>;
export type itemMapString = Map<string, number>;
export type itemMapStrings = Map<string, string>;

export type Pair<T> = [T, T];
export type itemMapPair<T> = Map<number, Pair<T>>;

export class SimpleEditStateModel {
  public items: SimpleEditModel[] = [];
  public mapItems: itemMap = new Map();
  public selected: SimpleEditModel | null = null;
}

export class SimpleEdit2StateModel {
  public items: SimpleEdit2Model[] = [];
  public mapTItems: itemMap = new Map();
  public mapFItems: itemMap = new Map();
  public selected?: SimpleEdit2Model | null;
}
