import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { forMap } from '@root/shared/rx-filtres';
import { SimpleEditService, SimpleEditServiceNames } from '@services/simple-edit.service';
import { Asset } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AddItem, DeleteItem, EditItem, FetchAssetTypes } from './assets.actions';
import { SimpleEditStateModel } from './simple-edit.state.model';

export class AssetStateModel {
  public items: Asset[] = [];
  public selectedItem: Asset | null = null;
  public count: number = 0;
  public loading: boolean = false;
}

@State<AssetStateModel>({
  name: 'assets',
  defaults: {
    items: [],
    selectedItem: null,
    count: 0,
    loading: false,
  },
})
@Injectable()
export class AssetsState {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getMapItem(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  @Action(FetchAssetTypes, { cancelUncompleted: true })
  public fetchItems({ getState, setState }: StateContext<SimpleEditStateModel>) {
    console.log('AssetsState::fetchItems() | method called');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEditServiceNames.ASSET).pipe(
        tap((items) => {
          const mapItems = new Map(items.map(forMap));
          setState({
            ...state,
            items,
            mapItems,
          });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
      );
    }
  }

  @Action(AddItem)
  public addItem({ getState, setState }: StateContext<SimpleEditStateModel>, { payload }) {
    const state = getState();
    return this.itemsService.create(payload.name, SimpleEditServiceNames.ASSET).pipe(
      tap((result) => {
        const mapItems = state.mapItems;
        mapItems.set(result.id, result.name);
        setState({
          ...state,
          items: [...state.items, result],
          mapItems,
        });
      }),
      catchError((error) => {
        console.error(error);
        return throwError(() => error);
      }),
    );
  }

  @Action(EditItem)
  public editItem({ getState, patchState }: StateContext<SimpleEditStateModel>, { payload }) {
    const state = getState();
    return this.itemsService.save$(payload, SimpleEditServiceNames.ASSET).pipe(
      tap(
        (result) => {
          const mapItems = state.mapItems;
          mapItems.set(result.id, result.name);
          const items = state.items;
          const idx = items.findIndex((el) => el.id === result.id);
          items[idx] = result;
          patchState({ items, mapItems });
        },
        catchError((err) => {
          return throwError(err);
        }),
      ),
    );
  }

  @Action(DeleteItem)
  public deleteItem({ getState, patchState }: StateContext<SimpleEditStateModel>, { payload }) {
    const state = getState();
    return this.itemsService.delete(payload, SimpleEditServiceNames.ASSET).pipe(
      tap(() => {
        const mapItems = state.mapItems;
        mapItems.delete(payload);
        patchState({
          items: state.items.filter(({ id }) => id !== payload),
          mapItems,
        });
      }),
      catchError((error) => {
        console.error(error);
        return throwError(() => error);
      }),
    );
  }
}
