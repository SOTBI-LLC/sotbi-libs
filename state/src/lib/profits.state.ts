import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddProfit,
  DeleteProfit,
  EditProfit,
  FetchProfits,
} from './profits.actions';
import type { SimpleEditStateModel } from './simple-edit.state.model';

@State<SimpleEditStateModel>({
  name: 'profits',
  defaults: {
    items: [],
    selected: null,
    mapItems: new Map(),
  },
})
@Injectable()
export class ProfitsState {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getMapItem(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  @Selector()
  public static getProfits(state: SimpleEditStateModel) {
    return state.items;
  }

  @Action(FetchProfits, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEditStateModel>) {
    // console.log('ProfitsState::fetchItems() | method called');
    const state = getState();
    if (!state.items.length) {
      this.itemsService.getAll(SimpleEditServiceNames.PROFIT_CAT).pipe(
        tap(
          (result) => {
            const mapItems = new Map(
              result.map((i): [number, string] => [i.id, i.name]),
            );
            setState({
              ...state,
              items: [...state.items, ...result],
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
  }

  @Action(AddProfit)
  public addItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: AddProfit,
  ) {
    const state = getState();
    return this.itemsService
      .create(payload.name, SimpleEditServiceNames.PROFIT_CAT)
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

  @Action(EditProfit)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditProfit,
  ) {
    const state = getState();
    return this.itemsService
      .save$(payload, SimpleEditServiceNames.PROFIT_CAT)
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
            return throwError(() => err);
          }),
        ),
      );
  }

  @Action(DeleteProfit)
  public deleteItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteProfit,
  ) {
    const state = getState();
    return this.itemsService
      .delete(payload, SimpleEditServiceNames.PROFIT_CAT)
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
