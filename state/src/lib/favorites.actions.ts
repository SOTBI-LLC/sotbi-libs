import type { Debtor } from '@sotbi/models';

export class FavoritesAddItems {
  public static readonly type = '[Favorites] Add items';
  constructor(public payload: Debtor[]) {}
}

export class FavoritesRemoveAllItems {
  public static readonly type = '[Favorites] Remove all items';
}

export class FavoritesFetchAll {
  public static readonly type = '[Favorites] Fetch all items';
}
