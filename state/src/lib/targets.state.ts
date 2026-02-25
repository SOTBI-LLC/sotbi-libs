import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { SimpleEditStateModel } from './simple-edit.state.model';
import {
  AddTarget,
  DeleteTarget,
  EditTarget,
  FetchTargetTypes,
} from './targets.actions';

@State<SimpleEditStateModel>({
  name: 'targets',
  defaults: {
    items: [],
    selected: null,
    mapItems: new Map(),
  },
})
@Injectable()
export class TargetsState {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getMapItem(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  @Action(FetchTargetTypes, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEditStateModel>) {
    // console.log('TargetsState::fetchItems() | method called');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEditServiceNames.TARGET).pipe(
        tap({
          next: (result) => {
            const mapItems = new Map(
              result.map((i): [number, string] => [i.id ?? 0, i.name]),
            );
            setState({
              ...state,
              items: result,
              mapItems,
            });
          },
          error: (error) => {
            console.error(error.message);
          },
        }),
        catchError((error) => {
          console.error(error);
          return throwError(() => error);
        }),
      );
    }
    return of();
  }

  @Action(AddTarget)
  public addItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: AddTarget,
  ) {
    const state = getState();
    return this.itemsService
      .create(payload.name ?? '', SimpleEditServiceNames.TARGET)
      .pipe(
        tap((result) => {
          const mapItems = state.mapItems;
          mapItems.set(result.id ?? 0, result.name);
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

  @Action(EditTarget)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditTarget,
  ) {
    const state = getState();
    return this.itemsService.save$(payload, SimpleEditServiceNames.TARGET).pipe(
      tap(
        (result) => {
          const mapItems = state.mapItems;
          mapItems.set(result.id ?? 0, result.name);
          const items = state.items;
          const idx = items.findIndex((el) => el.id === result.id);
          items[idx] = result;
          patchState({ items, mapItems });
        },
        catchError((error) => {
          console.error(error);
          return throwError(() => error);
        }),
      ),
    );
  }

  @Action(DeleteTarget)
  public async deleteItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteTarget,
  ) {
    return this.itemsService
      .delete(payload, SimpleEditServiceNames.TARGET)
      .pipe(
        tap(() => {
          const state = getState();
          const mapItems = state.mapItems;
          mapItems.delete(payload);
          patchState({
            items: state.items.filter(({ id }) => id !== payload),
            mapItems,
          });
        }),
      );
  }
}
