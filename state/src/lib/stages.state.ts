import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@root/service/simple-edit.service';
import { forMap } from '@root/shared/rx-filtres';
import { SimpleEditModel } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SimpleEditStateModel } from './simple-edit.state.model';
import { AddItem, DeleteItem, EditItem, FetchStages, GetItem } from './stages.actions';

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
  public fetchItems({ getState, setState }: StateContext<SimpleEditStateModel>) {
    // console.log('StageState::FetchStages');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEditServiceNames.STAGE).pipe(
        catchError((err) => {
          return throwError(err);
        }),
        tap(
          (result) => {
            const mapItems = new Map(result.map(forMap));
            setState({
              ...state,
              items: result,
              mapItems,
            });
          },
          (error) => {
            console.error(error.message);
          },
        ),
      );
    }
  }

  @Action(GetItem)
  public getItem({ patchState }: StateContext<SimpleEditStateModel>, { payload }) {
    return this.itemsService.get(SimpleEditServiceNames.STAGE, payload).pipe(
      tap((result) => {
        patchState({ selected: result });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(AddItem)
  public addItem({ getState, setState }: StateContext<SimpleEditStateModel>, { payload }) {
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

  @Action(EditItem)
  public editItem({ getState, patchState }: StateContext<SimpleEditStateModel>, { payload }) {
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
        throw err;
      }),
    );
  }

  @Action(DeleteItem)
  public deleteItem({ getState, setState }: StateContext<SimpleEditStateModel>, { payload }) {
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
