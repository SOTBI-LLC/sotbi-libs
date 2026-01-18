import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { FavoriteService } from '@services/favorite.service';
import { Debtor } from '@sotbi/models';
import {
  FavoritesAddItems,
  FavoritesFetchAll,
  FavoritesRemoveAllItems,
} from '@store/favorites.actions';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface FavoritesStateModel {
  items: Debtor[];
}

@State<FavoritesStateModel>({
  name: 'favorites',
  defaults: {
    items: [],
  },
})
@Injectable()
export class FavoritesState implements NgxsOnInit {
  private readonly itemsService = inject(FavoriteService);

  @Selector()
  public static getItems(state: FavoritesStateModel) {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<FavoritesStateModel>) {
    dispatch(new FavoritesFetchAll());
  }

  @Action(FavoritesFetchAll, { cancelUncompleted: false })
  public favoritesFetchAll({ patchState }: StateContext<FavoritesStateModel>) {
    return this.itemsService.getAll().pipe(
      tap((items: Debtor[]) => {
        patchState({ items });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(FavoritesAddItems, { cancelUncompleted: false })
  public favoritesAddItems(
    { patchState, dispatch }: StateContext<FavoritesStateModel>,
    { payload },
  ) {
    if (payload?.length > 0) {
      return this.itemsService.batchUpdate(payload.map((el: Debtor) => el.id)).pipe(
        tap((items: Debtor[]) => {
          patchState({ items });
        }),
      );
    } else {
      return dispatch(new FavoritesRemoveAllItems());
    }
  }

  @Action(FavoritesRemoveAllItems, { cancelUncompleted: false })
  public favoritesRemoveAllItems({ patchState }: StateContext<FavoritesStateModel>) {
    return this.itemsService.deleteAll().pipe(
      tap(() => {
        patchState({ items: [] });
      }),
    );
  }
}
