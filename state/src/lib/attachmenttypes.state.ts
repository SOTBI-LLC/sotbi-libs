import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import { forMap } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddItem,
  DeleteItem,
  EditItem,
  FetchAttachmentTypes,
} from './attachmenttypes.actions';
import type { SimpleEditStateModel } from './simple-edit.state.model';

@State<SimpleEditStateModel>({
  name: 'attachmenttypes',
  defaults: {
    items: [],
    selected: null,
    mapItems: new Map(),
  },
})
@Injectable()
export class AttachmentTypesState {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getMapItem(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  @Action(FetchAttachmentTypes, { cancelUncompleted: true })
  public fetchItems({
    getState,
    patchState,
  }: StateContext<SimpleEditStateModel>) {
    // console.log('AssetsState::fetchItems() | method called');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEditServiceNames.ATTACHMENT).pipe(
        tap(
          (result) => {
            const mapItems = new Map(result.map(forMap));
            patchState({
              items: result,
              mapItems,
            });
          },
          (error) => {
            console.error(error.message);
          },
        ),
        catchError((err) => {
          return throwError(err);
        }),
      );
    }
    return undefined;
  }

  @Action(AddItem)
  public addItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: AddItem,
  ) {
    const state = getState();
    return this.itemsService
      .create(payload.name, SimpleEditServiceNames.ATTACHMENT)
      .pipe(
        tap((result) => {
          const mapItems = state.mapItems;
          mapItems.set(result.id, result.name);
          patchState({
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
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditItem,
  ) {
    const state = getState();
    return this.itemsService
      .save$(payload, SimpleEditServiceNames.ATTACHMENT)
      .pipe(
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
  public deleteItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteItem,
  ) {
    const state = getState();
    return this.itemsService
      .delete(payload, SimpleEditServiceNames.ATTACHMENT)
      .pipe(
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
