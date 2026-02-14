import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import type { SimpleEditModel } from '@sotbi/models';
import { forMap } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddItem,
  DeleteItem,
  EditItem,
  FetchLinkTypes,
  GetItem,
} from './links.actions';
import type { SimpleEditStateModel } from './simple-edit.state.model';

@State<SimpleEditStateModel>({
  name: 'links',
  defaults: {
    items: [],
    mapItems: new Map(),
    selected: null,
  },
})
@Injectable()
export class LinkState implements NgxsOnInit {
  private readonly linkService = inject(SimpleEditService);

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  @Selector()
  public static getMapItems(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEditStateModel>) {
    dispatch(new FetchLinkTypes());
  }

  @Action(FetchLinkTypes, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEditStateModel>) {
    const state = getState();
    if (!state.items.length) {
      return this.linkService.getAll(SimpleEditServiceNames.LINK).pipe(
        catchError((err) => {
          return throwError(() => err);
        }),
        tap((result) => {
          const mapItems = new Map(result.map(forMap));
          setState({
            ...state,
            items: [...state.items, ...result],
            mapItems,
          });
        }),
      );
    }
  }

  @Action(GetItem)
  public getItem(
    { patchState }: StateContext<SimpleEditStateModel>,
    { payload }: GetItem,
  ) {
    return this.linkService.get(SimpleEditServiceNames.LINK, payload).pipe(
      tap((result) => {
        patchState({ selected: result });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(AddItem)
  public addItem(
    { getState, setState }: StateContext<SimpleEditStateModel>,
    { payload }: AddItem,
  ) {
    return this.linkService.create(payload, SimpleEditServiceNames.LINK).pipe(
      tap((result) => {
        const state = getState();
        const mapItems = state.mapItems;
        mapItems.set(result.id, result.name);
        setState({
          ...state,
          items: [...state.items, result],
          mapItems,
        });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  @Action(EditItem)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditItem,
  ) {
    return this.linkService.save$(payload, SimpleEditServiceNames.LINK).pipe(
      tap((result: SimpleEditModel) => {
        const state = getState();
        const items = state.items;
        const idx = items.findIndex((el) => el.id === result.id);
        items[idx] = result;
        const mapItems = state.mapItems;
        mapItems.set(result.id, result.name);
        patchState({ items, mapItems });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, setState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteItem,
  ) {
    return this.linkService.delete(payload, SimpleEditServiceNames.LINK).pipe(
      tap(() => {
        const state = getState();
        const mapItems = state.mapItems;
        mapItems.delete(payload);
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
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
