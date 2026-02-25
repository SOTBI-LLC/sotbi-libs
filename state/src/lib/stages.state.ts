import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import type { SimpleEditModel } from '@sotbi/models';
import { forMap } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { SimpleEditStateModel } from './simple-edit.state.model';
import {
  AddStage,
  DeleteStage,
  EditStage,
  FetchStages,
  GetStage,
} from './stages.actions';

@State<SimpleEditStateModel>({
  name: 'simpleedit',
  defaults: {
    items: [],
    mapItems: new Map(),
    selected: null,
  },
})
@Injectable()
export class StageState implements NgxsOnInit {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  @Selector()
  public static getMapItems(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEditStateModel>) {
    dispatch(new FetchStages());
  }

  @Action(FetchStages)
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEditStateModel>) {
    // console.log('StageState::FetchStages');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEditServiceNames.STAGE).pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
        tap((result) => {
          const mapItems = new Map(result.map(forMap));
          setState({
            ...state,
            items: result,
            mapItems,
          });
        }),
      );
    }
    return of();
  }

  @Action(GetStage)
  public getItem(
    { patchState }: StateContext<SimpleEditStateModel>,
    { payload }: GetStage,
  ) {
    return this.itemsService.get(SimpleEditServiceNames.STAGE, payload).pipe(
      tap((result) => {
        patchState({ selected: result });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  @Action(AddStage)
  public addItem(
    { getState, setState }: StateContext<SimpleEditStateModel>,
    { payload }: AddStage,
  ) {
    return this.itemsService.create(payload, SimpleEditServiceNames.STAGE).pipe(
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

  @Action(EditStage)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditStage,
  ) {
    return this.itemsService.save$(payload, SimpleEditServiceNames.STAGE).pipe(
      tap((result: SimpleEditModel) => {
        const state = getState();
        const mapItems = state.mapItems;
        mapItems.set(result.id, result.name);
        const items = state.items;
        const idx = items.findIndex((el) => el.id === result.id);
        items[idx] = result;
        patchState({ items, mapItems });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  @Action(DeleteStage)
  public deleteItem(
    { getState, setState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteStage,
  ) {
    return this.itemsService.delete(payload, SimpleEditServiceNames.STAGE).pipe(
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
