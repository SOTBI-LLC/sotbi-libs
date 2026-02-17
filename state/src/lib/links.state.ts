import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import type { SimpleEditModel } from '@sotbi/models';
import { forMap } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { GetLink } from './links.actions';
import { AddLink, DeleteLink, EditLink, FetchLinkTypes } from './links.actions';
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
      this.linkService.getAll(SimpleEditServiceNames.LINK).pipe(
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
    { payload }: GetLink,
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

  @Action(AddLink)
  public addItem(
    { getState, setState }: StateContext<SimpleEditStateModel>,
    { payload }: AddLink,
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

  @Action(EditLink)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditLink,
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

  @Action(DeleteLink)
  public deleteItem(
    { getState, setState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteLink,
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
